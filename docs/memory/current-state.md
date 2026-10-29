# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Phase 1 Complete -> Ready for Phase 2 (Control Plane / Next.js Web App)
- **Status**: Phase 1 Done

## 3. Recent Progress (Rolling Snapshot - Max 5)
- Implemented `@airlock/analyzer` with Acorn AST parsing, strict subset enforcement, anti-aliasing for `tools`, and adversarial test suite
- Implemented `@airlock/policy` with tag-based deterministic rule evaluation (`DENY` > `HOLD` > `ALLOW`)
- Implemented `@airlock/mocks` with prompt injection fixtures and expanded catalog of 50+ mock MCP tools
- Implemented `apps/gateway` with Fastify MCP endpoint (`search_tools`, `run_script`, `get_result`), sandboxed execution with runtime tool-proxy validation, atomic approvals, kill switch, and audit streams
- Passed monorepo test suite (100% pass across all 20 tests) and recorded ADR `0002-deterministic-script-gating-and-sandbox-proxy.md`

## 4. Next Immediate Steps
- [ ] Begin Phase 2: Implement Auth.js v5 with Google OAuth & Demo authentication in `apps/web`
- [ ] Implement RBAC data-access layer (`requireSession`, `requireRole`)
- [ ] Build Approvals review queue (`/app/approvals`), Audit stream viewer (`/app/audit`), and Dashboard
