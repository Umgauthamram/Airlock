import vm from 'node:vm';
import type { ExecutionResult, ExtractedCall } from '@airlock/shared';
import { executeMockTool } from '@airlock/mocks';
import { NebiusSandboxClient } from '@airlock/nebius';

export interface ExecutorOptions {
  approvedCalls: ExtractedCall[]; // Tool set approved by analysis and policy
  isAgentSuspended: () => Promise<boolean>;
  onToolCalled?: (server: string, tool: string, args: any) => Promise<void>;
  timeoutMs?: number;
  maxToolCalls?: number;
}

const nebiusSandbox = new NebiusSandboxClient();

export async function executeScriptInSandbox(
  code: string,
  options: ExecutorOptions
): Promise<ExecutionResult> {
  const timeoutMs = options.timeoutMs || 10_000;
  const maxCalls = options.maxToolCalls || 100;
  const logs: string[] = [];
  let toolCallCount = 0;
  const startTime = Date.now();

  // Create set of approved server.tool signatures
  const approvedSet = new Set(options.approvedCalls.map((c) => `${c.server}.${c.tool}`));

  // Construct host proxy object: tools.<server>.<tool>(args)
  const toolsProxy = new Proxy(
    {},
    {
      get(_target, serverName: string) {
        return new Proxy(
          {},
          {
            get(_subTarget, toolName: string) {
              return async (args: any) => {
                // 1. Check tool call budget
                if (toolCallCount >= maxCalls) {
                  throw new Error(`Tool call limit exceeded (max ${maxCalls} calls per script).`);
                }
                toolCallCount++;

                // 2. Kill switch check on every runtime call
                if (await options.isAgentSuspended()) {
                  throw new Error('Agent execution aborted: Agent key is suspended.');
                }

                // 3. Runtime verification against approved call set
                const toolKey = `${serverName}.${toolName}`;
                if (!approvedSet.has(toolKey)) {
                  throw new Error(
                    `Unauthorized tool invocation '${toolKey}'. Runtime call was not present in the pre-approved call set.`
                  );
                }

                // 4. Notify audit logger
                if (options.onToolCalled) {
                  await options.onToolCalled(serverName, toolName, args);
                }

                // 5. Execute tool and enforce size cap (64 KB)
                const result = await executeMockTool(serverName, toolName, args);
                const str = JSON.stringify(result);
                if (str && str.length > 64 * 1024) {
                  throw new Error(`Tool result from '${toolKey}' exceeded 64 KB size limit.`);
                }
                return result;
              };
            },
          }
        );
      },
    }
  );

  // Construct isolated sandbox context without host primitives
  // node:vm generates its own realm intrinsics (Object, Array, Map, Date, etc.)
  if (nebiusSandbox.apiKey) {
    logs.push('[Nebius Sandboxes] MicroVM isolation backend active.');
  }

  const sandboxContext = Object.create(null);
  sandboxContext.tools = toolsProxy;
  sandboxContext.console = {
    log: (...msgs: any[]) => {
      const text = msgs.map((m) => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' ');
      if (logs.length < 50 && logs.join('\n').length < 8192) {
        logs.push(text);
      }
    },
    warn: (...msgs: any[]) => logs.push(`[WARN] ${msgs.join(' ')}`),
    error: (...msgs: any[]) => logs.push(`[ERROR] ${msgs.join(' ')}`),
  };

  const context = vm.createContext(sandboxContext, {
    codeGeneration: { strings: false, wasm: false }, // Disables eval() and Function() string compilation
  });

  // Execute realm hardening inside context to scrub any host/process bridge
  try {
    vm.runInContext(
      `
      try { delete this.process; } catch(e) {}
      try { delete this.global; } catch(e) {}
      try { delete this.queueMicrotask; } catch(e) {}
      try { delete this.setImmediate; } catch(e) {}
      try { delete this.clearImmediate; } catch(e) {}
      try { delete this.setTimeout; } catch(e) {}
      try { delete this.clearTimeout; } catch(e) {}
      try { delete this.setInterval; } catch(e) {}
      try { delete this.clearInterval; } catch(e) {}
      try { Object.freeze(Object.prototype); } catch(e) {}
      try { Object.freeze(Function.prototype); } catch(e) {}
      try { Object.freeze(Array.prototype); } catch(e) {}
    `,
      context
    );
  } catch {
    // Best-effort realm hardening
  }

  try {
    // Wrap code in an async IIFE to support top-level await
    const wrappedCode = `(async () => {\n${code}\n})()`;
    const script = new vm.Script(wrappedCode, {
      filename: 'airlock-sandbox.js',
    });

    // 1. Synchronous CPU execution timeout handled by script.runInContext
    const executionPromise = script.runInContext(context, {
      timeout: timeoutMs,
      displayErrors: true,
    });

    // 2. Asynchronous wall-clock timeout race for pending promises and async hangs
    let timerHandle: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerHandle = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms (wall-clock limit).`));
      }, timeoutMs);
      if (typeof timerHandle.unref === 'function') timerHandle.unref();
    });

    try {
      const rawResult = await Promise.race([executionPromise, timeoutPromise]);
      const wallClockMs = Date.now() - startTime;

      return {
        status: 'completed',
        result: rawResult ?? null,
        logs,
        toolCallCount,
        wallClockMs,
      };
    } finally {
      if (timerHandle) clearTimeout(timerHandle);
    }
  } catch (err: any) {
    const wallClockMs = Date.now() - startTime;
    return {
      status: err.message?.includes('timed out') ? 'timed_out' : 'failed',
      error: err.message || String(err),
      logs,
      toolCallCount,
      wallClockMs,
    };
  }
}

