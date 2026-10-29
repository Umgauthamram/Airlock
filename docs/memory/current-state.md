# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Phase 0 Complete -> Ready for Phase 1 (Gateway Core)
- **Status**: Phase 0 Done

## 3. Recent Progress (Rolling Snapshot - Max 5)
- Migrated Next.js into `apps/web` and set up pnpm workspace (`pnpm-workspace.yaml`)
- Added Apache-2.0 `LICENSE`, `FEEDBACK.md`, and top-level `README.md`
- Created `infra/docker-compose.yml` for local Redis Stack (JSON + RediSearch)
- Implemented and tested `@airlock/shared` with cluster slot hash-tag builders, RBAC, and Zod schemas
- Configured `.env` and `.env.example` templates for local Redis, Auth.js, and Nebius Token Factory
- Documented ADR `0001-monorepo-and-redis-cluster-affinity.md`

## 4. Next Immediate Steps
- [ ] Begin Phase 1: Implement `@airlock/analyzer` (AST parser enforcing allowed syntax subset and anti-aliasing)
- [ ] Implement `@airlock/policy` (Deterministic tag-based engine with `deny` > `hold` > `allow` precedence)
- [ ] Implement `@airlock/mocks` and `apps/gateway` with sandbox execution and audit streams
