# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Real Account Simulation Enablement & Tab Isolation
- **Status**: Enabled simulation workflows (`simulate_attack`, `simulate_benign`) for real logged-in Google accounts so operators can test held approvals and telemetry without 403 Forbidden errors; preserved audit log immutability by clearing only simulated test approvals on production orgs. Isolated the "How To Do: Demo Account" tab so it only renders for demo evaluation accounts.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Redesigned Visual Product Tour**: Replaced text-heavy product tour in [ProductTourModal.tsx](file:///g:/projects/AirLock/apps/web/components/ProductTourModal.tsx) with a sleek, video-style interactive player featuring simulated scene previews (animated metrics, live approval card decision buttons, audit logs, and kill switch toggles) with an auto-play timer and concise 1-sentence action guidance.
- **Real Account Simulation Access**: Allowed real authenticated Google accounts in [/api/demo/simulate](file:///g:/projects/AirLock/apps/web/app/api/demo/simulate/route.ts) to trigger prompt injection exfiltration attacks and benign agent runs, while keeping production audit logs strictly immutable.
- **Demo Tab Separation in Guide**: Updated [FeatureGuide.tsx](file:///g:/projects/AirLock/apps/web/components/FeatureGuide.tsx) so logged-in Google users only see the "Real Account (Google Auth)" setup guide and test simulations, hiding the irrelevant demo account tab.
- **Pnpm Lockfile Vercel CI Sync**: Synchronized `pnpm-lock.yaml` with `package.json` devDependencies, enabling clean frozen lockfile builds on Vercel.
- **Sandbox Escape & Starvation Neutralized (F-01, F-04)**: Upgraded [executor.ts](file:///g:/projects/AirLock/apps/gateway/src/executor.ts) to execute untrusted scripts in dedicated `node:worker_threads` Workers with prototype scrubbing/freezing and parent termination kill timers.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
