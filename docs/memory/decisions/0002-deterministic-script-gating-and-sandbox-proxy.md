# 2. Deterministic AST Script Analysis and Sandbox Tool Proxy

Date: 2026-10-29
Status: Accepted

## Context
AI agents are susceptible to prompt injection attacks where malicious instructions embedded in untrusted content (emails, web pages, support tickets) instruct the agent to exfiltrate private data or perform destructive mutations. Traditional step-by-step tool calling hides the full attack plan because each single call appears benign in isolation. LLM-based guardrails can also be bypassed through jailbreaks and prompt manipulation.

## Decision
1. **Script-Mode Planning**: The agent submits its entire execution plan as a concise JavaScript script to the Airlock gateway.
2. **Deterministic AST Parsing (`@airlock/analyzer`)**:
   - Parse scripts via Acorn with strict subset enforcement: disallow `eval`, `Function`, `import`, `process`, `globalThis`, `this`, and prototype properties (`__proto__`, `constructor`, `prototype`).
   - Anti-aliasing Rule: The `tools` identifier can ONLY appear as `tools.<server>.<tool>(...)`. Dynamic indexing, variable assignment, destructuring, or passing `tools` as an argument is denied at analysis time.
3. **Deterministic Policy Engine (`@airlock/policy`)**:
   - Classify tools with semantic tags: `reads_untrusted`, `reads_private`, `writes_external`, `writes_internal`, `destructive`.
   - Strictly prioritize: `DENY` > `HOLD` > `ALLOW`.
   - Automatically hold scripts that combine `reads_untrusted` + `writes_external` (preventing prompt-injection exfiltration).
4. **Isolated Sandbox & Runtime Tool Proxy (`apps/gateway`)**:
   - Scripts execute within an isolated VM context with time limits and resource bounds.
   - The tool proxy validates each tool call at runtime against the pre-approved set from static analysis before dispatching to upstream MCP servers.
5. **Human-in-the-Loop Approvals**:
   - Held scripts produce pending approval records. Approving triggers exactly one sandbox execution, guarded by atomic status checks to prevent duplicate execution.

## Consequences
- Prompt injection attacks attempting external exfiltration are deterministically halted before execution.
- Zero reliance on probabilistic LLM guardrails for security-critical access control.
- An append-only audit trail records every submission, policy decision, approval, and proxy call.

