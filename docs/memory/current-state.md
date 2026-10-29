# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Hardening Gateway Security & Live Nemotron Runtime Integration
- **Status**: Core Security Boundaries Fixed (Sandbox Escapes Closed, Atomic Approvals, Control Plane Auth Guarded, Live Nemotron Inference Wired)

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Closed Sandbox Escape Vector**: Blocked prototype/constructor traversal in `@airlock/analyzer` (computed literals, template literals, global primitive member access) and scrubbed host globals/primitives in `executor.ts`.
- **Live Nemotron Runtime Wired**: Connected Nemotron Nano (automated policy risk explanations), Super (script synthesis and Reference Agent execution), and Ultra (script repair) at runtime via Nebius Token Factory.
- **Secured Gateway Control Endpoints**: Added bearer authorization guards on `/api/*` and enforced atomic state transitions (`pending` -> `executing` -> `approved`) to eliminate check-then-act race conditions.
- **Real Google OAuth & Session Expiry**: Replaced demo mock redirect with true Google OAuth authorization code flow (`/api/auth/google`, `/api/auth/callback/google`) and embedded cryptographic session expiration (`exp`).
- **Standard MCP Protocol & Deployment**: Added JSON-RPC 2.0 `tools/list` and `tools/call` support on `/mcp`, created `apps/gateway/Dockerfile` and `infra/Caddyfile` for VM deployment.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
