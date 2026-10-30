# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: External Audit & Hardening Remediation (`changes.md`)
- **Status**: Completed full resolution of Vercel build issues, sandbox escape vector blocking, OAuth/demo verification hardening, rate limiting, Docker and secret unification, and benchmark metric alignment.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Vercel Build Fix**: Removed stray root and web `package-lock.json` and root `vercel.json`; configured `apps/web/vercel.json` with pinned `npx pnpm@9.15.4` install and filtered build command to resolve lockfile version mismatch and `ERR_INVALID_THIS`.
- **Sandbox Escapes & AST Hardening**: Banned `Reflect`, `Proxy`, reflection properties (`getOwnPropertyNames`, `getPrototypeOf`, etc.), dynamic computed members, infinite loops (`while(true)`, `for(;;)`), and loop `await` non-tool starvation in [analyzer.ts](file:///g:/projects/AirLock/packages/analyzer/src/analyzer.ts) and [executor.ts](file:///g:/projects/AirLock/apps/gateway/src/executor.ts); added comprehensive test suite in [analyzer.test.ts](file:///g:/projects/AirLock/packages/analyzer/src/analyzer.test.ts).
- **Auth Hardening & Rate Limiting**: Added `email_verified` check, `ALLOWED_EMAIL_DOMAIN` enforcement, and status preservation in [google callback](file:///g:/projects/AirLock/apps/web/app/api/auth/callback/google/route.ts); removed unverified demo backdoors in `POST /api/auth/google` and `GET /api/auth/demo`; enforced crypto randomInt, 3-req/10min rate limiting, and 5-attempt brute-force protection in [verification.ts](file:///g:/projects/AirLock/apps/web/lib/verification.ts); salted demo orgIds with email hash to eliminate collisions; capped demo extensions to 16h total.
- **Docker, Caddy & Secret Unification**: Bound Redis (6379) and RedisInsight (8001) to `127.0.0.1` in [docker-compose.yml](file:///g:/projects/AirLock/infra/docker-compose.yml); pinned `pnpm@9.15.4` with `--frozen-lockfile` and unprivileged `USER node` in [Dockerfile](file:///g:/projects/AirLock/apps/gateway/Dockerfile); authored production [Caddyfile](file:///g:/projects/AirLock/infra/Caddyfile); unified master keys across gateway and web.
- **Decision & Benchmark Consistency**: Tied gateway decision route to `x-org-id`; aligned all benchmark token numbers to 99.6% (2,700 vs 607,957 tokens) across README, `benchmark-results.json`, and results page; added `isFallback` telemetry in Nebius client.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
