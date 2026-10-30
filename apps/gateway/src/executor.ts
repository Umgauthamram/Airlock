import { Worker } from 'node:worker_threads';
import type { ExecutionResult, ExtractedCall } from '@airlock/shared';
import { executeMockTool } from '@airlock/mocks';
import { web_search } from './tools/tavily.js';

export interface ExecutorOptions {
  approvedCalls: ExtractedCall[]; // Tool set approved by analysis and policy
  isAgentSuspended: () => Promise<boolean>;
  onToolCalled?: (server: string, tool: string, args: any) => Promise<void>;
  timeoutMs?: number;
  maxToolCalls?: number;
}

const WORKER_BOOTSTRAP_CODE = `
const { parentPort, workerData } = require('node:worker_threads');
const vm = require('node:vm');

(async () => {
  try {
    const sandbox = Object.create(null);
    const context = vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false },
    });

    vm.runInContext(\`
      try { delete this.process; } catch(e) {}
      try { delete this.global; } catch(e) {}
      try { delete this.Reflect; } catch(e) {}
      try { delete this.Proxy; } catch(e) {}
      try { delete this.queueMicrotask; } catch(e) {}
      try { delete this.setImmediate; } catch(e) {}
      try { delete this.clearImmediate; } catch(e) {}
      try { delete this.setTimeout; } catch(e) {}
      try { delete this.clearTimeout; } catch(e) {}
      try { delete this.setInterval; } catch(e) {}
      try { delete this.clearInterval; } catch(e) {}
      try { delete Object.getOwnPropertyNames; } catch(e) {}
      try { delete Object.getOwnPropertyDescriptors; } catch(e) {}
      try { delete Object.getOwnPropertyDescriptor; } catch(e) {}
      try { delete Object.getPrototypeOf; } catch(e) {}
      try { delete Object.setPrototypeOf; } catch(e) {}
      try { delete Object.defineProperty; } catch(e) {}
      try { delete Object.defineProperties; } catch(e) {}
      try {
        Object.defineProperty(Object.prototype, 'constructor', {
          get() { throw new Error('Access to constructor is prohibited'); },
          set() { throw new Error('Access to constructor is prohibited'); },
          configurable: false,
        });
      } catch(e) {}
      try {
        Object.defineProperty(Function.prototype, 'constructor', {
          get() { throw new Error('Access to constructor is prohibited'); },
          set() { throw new Error('Access to constructor is prohibited'); },
          configurable: false,
        });
      } catch(e) {}
      try {
        const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
        Object.defineProperty(AsyncFn.prototype, 'constructor', {
          get() { throw new Error('Access to constructor is prohibited'); },
          set() { throw new Error('Access to constructor is prohibited'); },
          configurable: false,
        });
      } catch(e) {}
      try { Object.freeze(Object.prototype); } catch(e) {}
      try { Object.freeze(Function.prototype); } catch(e) {}
      try { Object.freeze(Array.prototype); } catch(e) {}
    \`, context);

    const pendingCalls = new Map();
    let callIdSeq = 0;

    parentPort.on('message', (msg) => {
      if (msg.type === 'TOOL_RESULT') {
        const cb = pendingCalls.get(msg.callId);
        if (cb) {
          pendingCalls.delete(msg.callId);
          if (msg.error) {
            cb.reject(new Error(msg.error));
          } else {
            try {
              // Rebuild tool results strictly inside the sandbox realm
              const parsed = vm.runInContext('JSON.parse', context)(JSON.stringify(msg.result));
              cb.resolve(parsed);
            } catch (err) {
              cb.reject(err);
            }
          }
        }
      }
    });

    sandbox.console = {
      log: (...msgs) => {
        parentPort.postMessage({
          type: 'LOG',
          text: msgs.map((m) => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' ')
        });
      },
      warn: (...msgs) => parentPort.postMessage({ type: 'LOG', text: '[WARN] ' + msgs.join(' ') }),
      error: (...msgs) => parentPort.postMessage({ type: 'LOG', text: '[ERROR] ' + msgs.join(' ') }),
    };

    sandbox.tools = new Proxy({}, {
      get(_t, server) {
        if (server === 'constructor' || server === '__proto__' || server === 'prototype') return undefined;
        return new Proxy({}, {
          get(_st, tool) {
            if (tool === 'constructor' || tool === '__proto__' || tool === 'prototype') return undefined;
            const fn = (args) => {
              return new Promise((resolve, reject) => {
                const callId = ++callIdSeq;
                pendingCalls.set(callId, { resolve, reject });
                parentPort.postMessage({
                  type: 'CALL_TOOL',
                  callId,
                  server,
                  tool,
                  args: args ? JSON.parse(JSON.stringify(args)) : args,
                });
              });
            };
            Object.setPrototypeOf(fn, null);
            return fn;
          }
        });
      }
    });

    const wrappedCode = \`(async () => {\\n\${workerData.code}\\n})()\`;
    const script = new vm.Script(wrappedCode, { filename: 'airlock-sandbox.js' });
    const runPromise = script.runInContext(context, {
      timeout: workerData.timeoutMs || 10000,
      microtaskMode: 'afterEvaluate',
    });

    const result = await runPromise;
    parentPort.postMessage({ type: 'DONE', status: 'completed', result: result ?? null });
  } catch (err) {
    parentPort.postMessage({
      type: 'DONE',
      status: 'failed',
      error: err && err.message ? err.message : String(err)
    });
  }
})();
`;

export async function executeScriptInSandbox(
  code: string,
  options: ExecutorOptions
): Promise<ExecutionResult> {
  const timeoutMs = options.timeoutMs || 10_000;
  const maxCalls = options.maxToolCalls || 100;
  const logs: string[] = [];
  let toolCallCount = 0;
  const startTime = Date.now();

  const approvedSet = new Set(options.approvedCalls.map((c) => `${c.server}.${c.tool}`));

  return new Promise((resolve) => {
    let isSettled = false;
    let workerTimer: NodeJS.Timeout | undefined;

    const worker = new Worker(WORKER_BOOTSTRAP_CODE, {
      eval: true,
      workerData: { code, timeoutMs },
    });

    const cleanupAndResolve = async (res: ExecutionResult) => {
      if (isSettled) return;
      isSettled = true;
      if (workerTimer) clearTimeout(workerTimer);
      try {
        await worker.terminate();
      } catch {
        // Best effort worker cleanup
      }
      resolve(res);
    };

    workerTimer = setTimeout(() => {
      const wallClockMs = Date.now() - startTime;
      cleanupAndResolve({
        status: 'timed_out',
        error: `Execution timed out after ${timeoutMs}ms (wall-clock limit).`,
        logs,
        toolCallCount,
        wallClockMs,
      });
    }, timeoutMs);

    if (typeof workerTimer.unref === 'function') {
      workerTimer.unref();
    }

    worker.on('message', async (msg: any) => {
      if (msg.type === 'LOG') {
        if (logs.length < 50 && logs.join('\n').length < 8192) {
          logs.push(msg.text);
        }
      } else if (msg.type === 'CALL_TOOL') {
        if (toolCallCount >= maxCalls) {
          worker.postMessage({
            type: 'TOOL_RESULT',
            callId: msg.callId,
            error: `Tool call limit exceeded (max ${maxCalls} calls per script).`,
          });
          return;
        }
        toolCallCount++;

        if (await options.isAgentSuspended()) {
          worker.postMessage({
            type: 'TOOL_RESULT',
            callId: msg.callId,
            error: 'Agent execution aborted: Agent key is suspended.',
          });
          return;
        }

        const toolKey = `${msg.server}.${msg.tool}`;
        if (approvedSet.size > 0 && !approvedSet.has(toolKey)) {
          worker.postMessage({
            type: 'TOOL_RESULT',
            callId: msg.callId,
            error: `Unauthorized tool invocation '${toolKey}'. Runtime call was not present in the pre-approved call set.`,
          });
          return;
        }

        if (options.onToolCalled) {
          await options.onToolCalled(msg.server, msg.tool, msg.args);
        }

        try {
          let hostResult: any;
          if (msg.server === 'tavily' && msg.tool === 'web_search') {
            hostResult = await web_search(msg.args?.query || '', msg.args?.maxResults || 5);
          } else {
            hostResult = await executeMockTool(msg.server, msg.tool, msg.args);
          }
          const str = JSON.stringify(hostResult);
          if (str && str.length > 64 * 1024) {
            worker.postMessage({
              type: 'TOOL_RESULT',
              callId: msg.callId,
              error: `Tool result from '${toolKey}' exceeded 64 KB size limit.`,
            });
            return;
          }
          worker.postMessage({
            type: 'TOOL_RESULT',
            callId: msg.callId,
            result: hostResult,
          });
        } catch (err: any) {
          worker.postMessage({
            type: 'TOOL_RESULT',
            callId: msg.callId,
            error: err.message || String(err),
          });
        }
      } else if (msg.type === 'DONE') {
        const wallClockMs = Date.now() - startTime;
        cleanupAndResolve({
          status: msg.status,
          result: msg.result ?? null,
          error: msg.error,
          logs,
          toolCallCount,
          wallClockMs,
        });
      }
    });

    worker.on('error', (err) => {
      const wallClockMs = Date.now() - startTime;
      cleanupAndResolve({
        status: 'failed',
        error: err.message || String(err),
        logs,
        toolCallCount,
        wallClockMs,
      });
    });
  });
}
