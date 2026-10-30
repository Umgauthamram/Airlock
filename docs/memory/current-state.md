# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Clean Initial Account State & Comprehensive Feature Walkthrough Guide
- **Status**: Completed clean zero-state for new demo and Google Auth accounts (0 calls, 0 tokens, 0 pending), created interactive [FeatureGuide.tsx](file:///g:/projects/AirLock/apps/web/components/FeatureGuide.tsx) with platform preview, real vs demo account setup guides, and one-click test simulation controls at `/app/guide` and on `/app`.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Fresh Account Zero-State**: Removed automatic test data and fabricated metric fallbacks in [data.ts](file:///g:/projects/AirLock/apps/web/lib/data.ts) and [demo-verify](file:///g:/projects/AirLock/apps/web/app/api/auth/demo-verify/route.ts); accounts now initialize with 0 runs, 0 tokens saved, and an empty pending queue.
- **Interactive Feature & Setup Guide**: Created [FeatureGuide.tsx](file:///g:/projects/AirLock/apps/web/components/FeatureGuide.tsx) and `/app/guide` covering AST deterministic analysis, R1-R6 policy rules, approval flows, sandbox isolation, and audit streams.
- **Dedicated Real Account & Demo Account Guides**: Structured walkthroughs detailing how to configure production MCP agents (Claude Desktop, Cursor, LangChain) with `Authorization: Bearer <AIRLOCK_MASTER_KEY>` vs how to test the 12-hour evaluation sandbox.
- **Interactive Testing Simulation Endpoint**: Created `/api/demo/simulate` allowing evaluators to simulate prompt injection holding, run benign tasks, or reset state to 0 on demand.
- **Vercel & Security Hardening Push**: Pushed all audit fixes to GitHub `main` (`commit 5bd4372`), verified frozen lockfile builds, and passed all 25 unit/integration tests across monorepo packages.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
