# Airlock: Technical Requirements Document

Draft v0.1 · October 29, 2026 · Companion to the Airlock PRD

## 1. Decisions locked in

- **Language and layout.** TypeScript everywhere, in a pnpm monorepo.
- **Control plane.** Next.js (App Router) on Vercel: landing page, login, admin UI, and the human-facing API.
- **Data plane.** A Node gateway and worker on a Nebius VM, run with Docker Compose: the agent-facing MCP endpoint, script analysis, policy, approvals, and sandboxed execution.
- **Database.** Redis Cloud with JSON, Search (including vector fields), and Streams enabled. Plain Redis is not enough.
- **Auth.** Auth.js v5 with Google OAuth and JWT sessions. Users, roles, and invites live in Redis.
- **Tenancy.** One organization, with `org_id` in every key so multi-tenancy can be added later. Three roles: Admin, Operator, Viewer.
- **Models.** Nebius Token Factory (OpenAI-compatible API) for every model call, using NVIDIA Nemotron Nano, Super, and Ultra.

**Why split Vercel and the VM.** Vercel functions are short-lived and time-limited. That suits the UI and admin API. It does not suit long-lived stream consumers, the MCP endpoint, or sandbox execution. The VM runs those. As a side benefit, no model API key is ever stored on Vercel.

## 2. Architecture

```
Agent (any MCP client)
   | HTTPS + agent API key
   v
[Gateway]  Nebius VM
   |-- analyze script --> [Policy] --allow--> [Worker: isolate] --> upstream MCP servers
   |                          |
   |                          +--hold--> approvals queue (Redis)
   |
   +-- Redis Cloud: JSON, Search, Streams, counters, pub/sub
   |
[Web UI + API]  Vercel  <-- Google OAuth --> humans (Admin, Operator, Viewer)

Token Factory (Nemotron Nano / Super / Ultra) is called only from the VM:
reference agent, tool-tag suggestions, plain-language explanations.
```

Request lifecycle for a script:

1. The agent calls `run_script` with code.
2. The gateway authenticates the key, checks the kill switch, rate limit, and budget.
3. The analyzer parses the code and extracts the tool calls. Invalid or dynamic code is denied.
4. The policy engine evaluates the call set and returns allow, hold, or deny with reasons.
5. Allow: enqueue to the worker. Hold: create an approval and return its id. Deny: return the reasons.
6. The worker re-validates, runs the code in an isolate, proxies every tool call through the gateway checks, and stores the result.
7. Every step appends to the audit stream.

## 3. Repository layout

```
airlock/
  apps/
    web/        Next.js app: landing, login, app UI, admin API routes
    gateway/    Node service: MCP endpoint, approvals, worker entrypoint
  packages/
    shared/     types, Redis key builders, zod schemas, role helpers
    analyzer/   AST parsing and syntax rules (pure, no I/O)
    policy/     rule evaluation (pure, no I/O)
    nebius/     Token Factory client, tier mapping, usage accounting
    agent-ref/  reference agent: classic mode and code mode
    mocks/      mock MCP servers and attack fixtures
    bench/      benchmark harness
  infra/        docker-compose.yml, Caddyfile, Redis index setup script
  LICENSE       Apache-2.0 (proposed)
  README.md, FEEDBACK.md
```

The analyzer and policy packages are pure functions so they can be tested hard and reused by the playground.

## 4. Authentication and authorization (web)

**Sign-in flow**

- Auth.js v5 with the Google provider, scopes `openid email profile`, JWT sessions with an 8-hour maximum age.
- In the `signIn` callback: require a verified email. If configured, check the hosted-domain claim on the ID token server-side (do not rely on the request parameter alone).
- Then resolve the user by email:
  - Existing active user: allow.
  - Pending invite for that email: create the user with the invited role, delete the invite atomically, allow.
  - Email listed in `BOOTSTRAP_ADMIN_EMAILS` and no Admin exists yet: create an Admin, allow.
  - Otherwise: redirect to `/request-access` and create no session.
- Write a `login` event to the audit stream.

**Session and role freshness**

- The JWT carries `userId`, `orgId`, and `role` from sign-in time. A background re-check reads the user from Redis every 5 minutes, and a deactivated user loses the session.
- For every mutating request and every sensitive read, `requireRole(min)` re-reads the role from Redis. Role changes and deactivation take effect immediately where it matters.

**Enforcement rules**

- Roles are ordered viewer < operator < admin. No custom roles in v1.
- Every route handler, server action, and server component that touches data calls `requireSession()` or `requireRole()` in a shared data-access layer. Middleware is used only to redirect signed-out users and is never the sole check. (A past Next.js middleware bypass, CVE-2025-29927, recalled from memory, is the reason.)
- `orgId` always comes from the session, never from request input.
- Guards: the last Admin cannot be demoted or deactivated, and nobody can change their own role.

**Agent authentication (data plane)**

- Keys look like `alk_live_<random 32 bytes, base62>`. Only the SHA-256 hash is stored. The plain key is shown once. The prefix is stored for display.
- Each key belongs to one agent record with tool-group scopes, budgets, and a status. Compare in constant time.

**Demo mode**

- Behind `DEMO_MODE=1`, a credentials provider named `demo` issues an Operator session bound to `orgId = demo`. The demo org has seeded data, mock upstream servers only, tighter rate limits, and an hourly reset.
- Because `orgId` comes from the session and every key contains it, demo sessions cannot reach real data. The hackathon deployment doubles as the demo deployment. A real production deployment runs with demo mode off.

## 5. Redis data model

**Convention.** Keys are `org:{<orgId>}:<type>:<id>`. The braces are a hash tag, so all keys of one org land in one cluster slot and multi-key Lua scripts work. The org ids are `main` and `demo`.

**Documents (RedisJSON)**

- `org:{o}:user:<userId>`: id, email, name, image, role, status, createdAt, lastLoginAt
- `org:{o}:invite:<emailLower>`: role, invitedBy, expiresAt (TTL 14 days)
- `org:{o}:agent:<agentId>`: name, keyPrefix, scopes, budget, status, lastUsedAt
- `org:{o}:server:<serverId>`: name, transport, url, encrypted credentials, status
- `org:{o}:tool:<server>:<name>`: description, inputSchema, tags, tagStatus (`pending`, `suggested`, `confirmed`), contentHash, embedding
- `org:{o}:policy:active` and `org:{o}:policy:v:<n>`: versioned rules
- `org:{o}:script:<sha256>`: code, ast summary, extracted calls, last decision, policy version
- `org:{o}:approval:<id>`: script hash, agent id, flagged flows, explanation, status, decidedBy, decidedAt (pending items get a 24-hour TTL, so expiry means denial)
- `org:{o}:result:<approvalId or runId>`: result payload, size-capped, short TTL

**Lookups (strings)**

- `org:{o}:user_by_email:<emailLower>` to user id
- `org:{o}:agentkey:<keyHash>` to agent id
- `org:{o}:scriptcache:<hash>` to script hash
- `org:{o}:killswitch:<agentId>` flag

**Counters and limits**

- `org:{o}:budget:<agentId>:<yyyymmdd>`: hash with tokens, calls, cost in micro-USD
- `org:{o}:rl:<agentId>`: sorted set for a sliding-window rate limit

**Streams**

- `org:{o}:stream:audit`: append-only audit log, trimmed by age (default 30 days)
- `org:{o}:stream:jobs` with consumer group `workers`, plus `org:{o}:stream:jobs:dlq` for jobs that failed after retries
- `org:{o}:stream:playground`: playground run requests from the web app to the VM

**Search indexes (RediSearch)**

- `idx:tools` over the tool documents: `name` TEXT, `description` TEXT, `server` TAG, `tags` TAG, `tagStatus` TAG, `embedding` VECTOR (cosine, dimension set by the chosen embedding model). If the embedding model is unavailable, fall back to full-text search only.

**Lua scripts (atomic)**

- `budget_consume`: check and increment budget and rate limit in one step, return remaining.
- `approval_decide`: move an approval from pending to approved or denied only if still pending, and enqueue the job on approval, so double-clicks and races cannot run a script twice.
- `invite_consume`: delete an invite and create the user atomically.

**ACL users on Redis Cloud**

- `web`: restricted to the key patterns and commands the control plane needs. It cannot read encrypted upstream credentials.
- `gateway`: the application key space. No default user in use. TLS required.

## 6. APIs

**Agent-facing (gateway)**, `POST /mcp`, Streamable HTTP MCP, header `Authorization: Bearer alk_live_...`. Use the official MCP TypeScript SDK and confirm the current transport API in Phase 0.

- `search_tools({ query, limit })`: returns TypeScript stubs for the top matching tools in the agent’s scope whose tags are confirmed. Descriptions are length-limited and stripped of control characters.
- `run_script({ code, intent? })`: returns one of `completed` (result, logs, usage), `held` (approvalId, reasons), `denied` (reasons), or `error`.
- `get_result({ approvalId })`: returns `pending`, `running`, `completed`, `denied`, or `expired`, with the result when available.
- `find_script({ intent })` (P1): returns previously vetted scripts that match the intent so the agent can skip generation. This adds a fourth tool, so update PRD US-1 when it is built.

**Operational (gateway)**: `GET /healthz`, `GET /metrics` (Prometheus text).

**Control plane (Next.js route handlers, session auth, role in brackets)**

- `GET /api/approvals`, `GET /api/approvals/:id` \[Viewer\]
- `POST /api/approvals/:id/decision` with decision and note \[Operator\]
- `GET /api/audit` with filters, `GET /api/audit/export` \[Viewer\]
- `GET /api/events?after=<streamId>` for the live feed \[Viewer\]. The client polls every 2 seconds against `XRANGE`, which works on serverless and avoids long-lived connections.
- `POST /api/agents`, `DELETE /api/agents/:id`, key creation and rotation \[Admin\]
- `POST /api/agents/:id/suspend` and `/resume` \[Operator\]
- `PUT /api/policy` \[Admin\], `GET /api/policy` \[Viewer\]
- `POST /api/servers`, `POST /api/tools/:id/tags` \[Admin\]
- `POST /api/users/invite`, `PATCH /api/users/:id` \[Admin\]
- `POST /api/playground/run` \[Operator\]: writes a request to the playground stream; the VM runs the reference agent and writes results back.

## 7. Script pipeline

### 7.1 Syntax subset and static extraction

Agents write JavaScript. The analyzer parses it with an ESTree parser (for example acorn) and enforces a small allowed subset. The subset exists so that tool use can be extracted statically. It is not the security boundary (see 7.4).

- **Allowed.** `const` and `let`, `if`, `for`, `for...of`, `while`, `try/catch`, arrow functions and function declarations, `await`, literals, template literals, object and array literals, spread, binary, logical, unary, conditional, assignment and update expressions, member access, and `new` only for `Map`, `Set`, and `Date`.
- **Rejected.** `eval`, `Function`, `import`, `export`, `require`, dynamic `import()`, `class`, `with`, `this`, generators, getters and setters, tagged templates, labels, and the identifiers `globalThis`, `self`, `window`, `process`, `constructor`, `__proto__`, and `prototype`.
- **The `tools` rule.** The identifier `tools` may only appear as the root of a call shaped `tools.<server>.<tool>(...)` with plain identifiers. Aliasing it, passing it to a function, indexing it with a computed key, or destructuring it is rejected. This makes the set of tools a script can call fully knowable before it runs.
- **Output of analysis.** A list of calls with server, tool, line, and whether the call sits inside a loop, plus the overall tool set and a content hash of the normalized AST.

### 7.2 Policy

Tools carry tags: `reads_untrusted`, `reads_private`, `writes_external`, `writes_internal`, `destructive`. Rules run over the union of tags in the script, the agent’s scopes, and loop context.

```
version: 3
rules:
  - id: R1
    when: { all: [reads_untrusted, writes_external] }
    action: hold
    message: Untrusted content and an external write in one script.
  - id: R2
    when: { all: [reads_private, writes_external] }
    action: hold
  - id: R3
    when: { any: [destructive] }
    action: hold
  - id: R4
    when: { tool_outside_agent_scope: true }
    action: deny
  - id: R5
    when: { write_call_in_loop: true }
    action: hold
default: allow
```

Precedence is deny, then hold, then allow. Every decision stores the policy version and the rule ids that fired. v1 is deliberately coarse: it looks at the script as a whole. Variable-level taint tracking is Phase 4.

### 7.3 Caching

- **Analysis cache.** Keyed by script content hash. Saves CPU, not tokens.
- **Script reuse.** `find_script` returns vetted scripts for a matching intent, keyed by org, normalized intent, tool-set version, and policy version. When the policy version has changed, the stored decision is recomputed before use. Token savings from this path only apply when the agent calls `find_script` before generating.
- **Tool search.** Vector search over tool descriptions means the agent loads only a few stubs instead of the whole catalog. This is the main source of the token reduction in the benchmark.

### 7.4 Execution and sandbox

- The worker reads jobs with `XREADGROUP`, loads the script by hash, and re-runs the analyzer and the policy at the current policy version. If the policy now says deny, the job is denied.
- Run the code in a fresh V8 isolate. Primary candidate: `isolated-vm`. Alternative: `quickjs-emscripten` (WASM, no native build). Spike both for 30 minutes in Phase 0 and record the choice.
- **Limits (initial).** 128 MB memory, 10 seconds of CPU, 30 seconds wall clock, 100 tool calls, 64 KB per tool result, 64 KB for the final result, 8 KB of captured console output.
- **Tool proxy.** The only bridge into the isolate is a host function. For each call it checks that the (server, tool) pair is in the approved set from analysis, then the kill switch, rate limit, and budget, then the egress rules for tools tagged `writes_external`, then forwards to the upstream MCP server with a timeout and size cap, then appends to the audit stream. The runtime check means a gap in static analysis cannot widen what a script may call.
- **Defense in depth.** A V8 isolate is a strong boundary but not a perfect one. The worker runs as a non-root user in a container with a read-only root filesystem, dropped capabilities, no host mounts, and a firewall that allows egress only to Redis Cloud, Token Factory, and registered upstreams. Isolates are disposed after each run. Fallback if the isolate library fails: one locked-down container per script.

## 8. Models on Token Factory

- **API.** OpenAI-compatible, base URL `https://api.tokenfactory.nebius.com/v1/`, key in `NEBIUS_API_KEY` on the VM only.
- **Model ids.** Discover with `GET /v1/models` at startup and map to tiers. Ids seen in other teams’ public repos, used here only as hints: `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`, `nvidia/nemotron-3-super-120b-a12b`, `nvidia/Nemotron-3-Ultra-550b-a55b`.
- **Assignments.**
  - Nano: suggest tags for newly discovered tools, and write short explanations of held scripts.
  - Super: the reference agent that writes scripts.
  - Ultra: one repair attempt when the analyzer rejects a script or a run fails, and explanations for held scripts with several flagged flows.
  - Policy decisions never depend on any model output.
- **Accounting.** Read token counts from the `usage` field of each response. Keep a `prices.json` filled from the official Nebius pricing page, not from memory.
- **Resilience.** Retry 429 and 5xx with backoff and jitter (3 attempts), 60-second timeout, budget check before each call.
- **Gotcha to test.** Another team reported that setting `reasoning_effort` to `none` produced an empty answer on Nano. Test each tier with the exact parameters you plan to use, and keep them in config.
- **Embeddings.** Model to be confirmed in Phase 0.

## 9. Upstream servers and credentials

- The gateway acts as an MCP client to upstream servers registered in the tool registry.
- Upstream credentials are encrypted with AES-256-GCM using a 32-byte `AIRLOCK_MASTER_KEY` and a random nonce per record. Only the gateway decrypts them. The UI can write them but never read them back. Key rotation is Phase 4.
- **Tool poisoning and rug pulls.** Tool descriptions are untrusted input. Store a content hash of each tool’s description and schema. If it changes, set `tagStatus` back to `pending` and block calls until an Admin re-confirms.

## 10. Security and threat model

- **Injection through tool output leads the agent to write a bad script.** Policy holds untrusted-to-external flows, and the runtime proxy enforces the approved call set.
- **Policy bypass through dynamic dispatch.** Rejected by the analyzer, and enforced again at runtime.
- **Sandbox escape.** Isolate boundary, container hardening, egress firewall, and an adversarial test suite.
- **Approval fatigue or social engineering.** The approval screen shows exact tools, destination hosts, the data classes involved, and the code. There is no approve-all control, and the hold rate is a dashboard metric.
- **Approval replay.** Approvals are bound to a script hash and consumed once through an atomic Lua transition.
- **Stolen agent key.** Hashed at rest, scoped, budgeted, revocable, and covered by the kill switch.
- **Privilege escalation in the UI.** Server-side role checks on every operation, role re-read from Redis on mutations, no reliance on middleware alone.
- **XSS and CSRF.** Auth.js CSRF protection, React escaping, a strict CSP, and script code always rendered as plain text.
- **SSRF through an HTTP tool.** Per-tool host allowlists, block private and metadata address ranges, and resolve DNS before connecting to defend against rebinding.
- **Secret leakage.** Log redaction, pattern-based redaction of audit arguments, no tool outputs stored by default.
- **Redis exposure.** TLS, ACL users, strong passwords, no default user.
- **Denial of service.** Request size limits and rate limits at the reverse proxy, and per-agent limits in Redis.

## 11. Deployment

**Vercel (apps/web).** Environment variables: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`, `REDIS_URL` (the `web` ACL user), `BOOTSTRAP_ADMIN_EMAILS`, `ALLOWED_EMAIL_DOMAIN` (optional), `GATEWAY_PUBLIC_URL`, `DEMO_MODE`. No model key. Choose the Vercel function region close to Redis Cloud.

**Google Cloud.** A Web application OAuth client. Authorized redirect URI: `https://<app-domain>/api/auth/callback/google`. Scopes are only `openid email profile`. Set the consent screen to production status so users beyond the test list can sign in, and check Google’s current verification rules for basic scopes.

**Redis Cloud.** A database with JSON and Search enabled, TLS on, two ACL users, a region near the VM. An idempotent `infra` script creates the indexes.

**Nebius VM.** Docker Compose with these services: `gateway`, `worker` (two replicas), `caddy` (automatic TLS, request size and rate limits), and `mock-mcp` (demo only). Firewall: inbound 443, SSH restricted to known addresses. Restart policy `unless-stopped`, health checks, log rotation. A cron job reseeds `org:{demo}` hourly. Secrets come from an env file with mode 600 for now, and a secret manager in Phase 4.

**Domains.** `app.<domain>` to Vercel, `gateway.<domain>` to the VM.

**CI/CD.** GitHub Actions: install, typecheck, lint, unit tests, integration tests against a Redis Stack service container, build. Vercel deploys the web app from Git. The VM deploys from pushed images with `docker compose pull && up -d`. Rollback means redeploying the previous image tag.

**Local.** `docker compose up` starts Redis Stack, gateway, worker, and mocks. A development-only credentials login exists behind a flag and is never enabled in production.

## 12. Observability and testing

- Structured JSON logs (pino) with request id, org id, and agent id.
- `/healthz` checks Redis and a cached Token Factory reachability probe.
- `/metrics` exposes decision counts, latency histograms, queue depth, dead-letter size, and token usage.
- The audit stream is the source of truth, and the dashboard reads it.

**Tests**

- Unit tests for the analyzer and policy: table-driven cases plus fuzzing.
- An adversarial corpus of at least 40 scripts covering aliasing, computed access, prototype tricks, `eval` variants, the `Function` constructor, infinite loops, memory bombs, oversized outputs, and slow loops. Each must be rejected or contained.
- Integration test of the full path: hold, approve, run, result, audit.
- RBAC test matrix: every route against every role, plus signed-out.
- Playwright smoke tests: landing renders, login page renders, demo mode completes the attack scenario.
- Benchmark harness (`pnpm bench`) producing the numbers described in the PRD.

**Definition of done for each P0 item.** Code merged, tests passing, audit events emitted, role checks covered by a test, and documented in the README.

## 13. Open technical questions

- Which embedding model does Token Factory serve, and what dimension? Fallback is full-text search.
- Does the chosen Redis Cloud plan include Search and JSON with enough memory for the vector index?
- Does `isolated-vm` build and run cleanly on the Nebius VM image, or should QuickJS WASM be the primary?
- What is the real round-trip latency between the Vercel region, Redis Cloud, and the VM?
- Are Token Factory rate limits enough for benchmark runs, or do runs need pacing?
- What exact Streamable HTTP transport surface does the current MCP SDK expose?
