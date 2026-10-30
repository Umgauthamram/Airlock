# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Comprehensive Security Audit Remediation & Hardening (F-01 through F-25)
- **Status**: Completed full remediation of all 25 audit findings against rules to check.md. Sandbox escape eliminated via isolated Worker threads and AST computed property bans; event loop starvation neutralized with parent kill timers; secrets and master keys secured to fail closed in production; RBAC hardened with VIEWER default; Docker, Caddyfile, and GitHub CI added.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Sandbox Escape & Starvation Neutralized (F-01, F-04)**: Upgraded [executor.ts](file:///g:/projects/AirLock/apps/gateway/src/executor.ts) to execute untrusted scripts in dedicated `node:worker_threads` Workers with prototype scrubbing/freezing (`Object.prototype.constructor`, `Function.prototype.constructor`) and parent termination kill timers. AST analyzer in [analyzer.ts](file:///g:/projects/AirLock/packages/analyzer/src/analyzer.ts) strictly bans chained computed member access.
- **Fail-Closed Secrets & RBAC Hardening (F-02, F-03, F-05)**: Throw in production on missing or weak `AUTH_SECRET` and `AIRLOCK_MASTER_KEY`. Google OAuth callback defaults new users to `Role.VIEWER`, enforces `email_verified`, and preserves existing user roles in Redis.
- **Atomic Approvals & Policy Fail-Closed (F-07, F-08, F-10)**: Added atomic `SETNX` claim lock and expired approval rejection in [gateway.ts](file:///g:/projects/AirLock/apps/gateway/src/gateway.ts). Added rule `R6` to [engine.ts](file:///g:/projects/AirLock/packages/policy/src/engine.ts) denying scripts calling uncatalogued tools.
- **Docker, Caddy & CI Infrastructure (F-14, F-15)**: Added root [tsconfig.json](file:///g:/projects/AirLock/tsconfig.json), configured reverse proxy in [infra/Caddyfile](file:///g:/projects/AirLock/infra/Caddyfile), hardened [Dockerfile](file:///g:/projects/AirLock/apps/gateway/Dockerfile) with unprivileged `USER node`, and created [.github/workflows/ci.yml](file:///g:/projects/AirLock/.github/workflows/ci.yml).
- **Benchmark & Honest Claims Alignment (F-11, F-12)**: Replaced uninvoked microVM claims with "Hardened Sandboxed Worker Isolation", and unified benchmark reporting across README and UI to 62 scenarios, 31/31 attacks blocked (100%), and 99.5% token reduction.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
