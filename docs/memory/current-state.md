# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Phase 2 Complete -> Ready for Phase 3 (Demo, Proof, Benchmark & Submission)
- **Status**: Phase 2 Done

## 3. Recent Progress (Rolling Snapshot - Max 5)
- Implemented Next.js 16 App Router control plane (`apps/web`) with Source Serif 4 & IBM Plex typography
- Built server-side RBAC data-access layer (`requireSession`, `requireRole`) and instant Demo Mode (`/api/auth/demo`)
- Developed application screens: Approvals queue & inspection detail, Audit stream explorer, Agents & Kill switch, Upstream tools catalog, Policies table, and System dashboard
- Built public landing page (`/`), Login (`/login`), Documentation (`/docs`), and Request Access (`/request-access`)
- Verified optimized Next.js production build (`next build`) and recorded ADR `0003-control-plane-rbac-and-demo-isolation.md`

## 4. Next Immediate Steps
- [ ] Begin Phase 3: Implement `@airlock/nebius` (Token Factory client for Nemotron Nano, Super, Ultra)
- [ ] Implement `@airlock/agent-ref` (side-by-side classic tool-calling vs Airlock script mode)
- [ ] Implement `@airlock/bench` (benchmark suite measuring block rate, token savings, and latency)
