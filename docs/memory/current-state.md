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
- **HMAC-Signed OAuth State & Dynamic Origin**: Upgraded Google OAuth flow in [auth.ts](file:///g:/projects/AirLock/apps/web/lib/auth.ts) and [callback](file:///g:/projects/AirLock/apps/web/app/api/auth/callback/google/route.ts) with cryptographically signed timestamped nonces and dynamic base URL detection, completely eliminating `invalid_oauth_state` on multi-tab or cross-site redirects.
- **Enterprise Typography & Emoji Removal**: Removed emoji icons (`⚡`, `💡`, `🧭`, `🛡️`, etc.) across all web pages and components in favor of clean, professional enterprise styling.
- **Persistent Session Across Reloads**: Implemented direct response cookie attachment and deterministic fallback secrets ensuring Google OAuth sessions remain signed in on page refresh.
- **Interactive 7-Step Product Tour**: Created [ProductTourModal.tsx](file:///g:/projects/AirLock/apps/web/components/ProductTourModal.tsx) guiding first-time users through Overview, Approvals, Audit Trail, Agents, Tools, Policies, and Benchmark.
- **Fresh Account Zero-State**: Guaranteed clean zero-state for new demo and Google Auth accounts (0 calls, 0 tokens, 0 pending).

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
