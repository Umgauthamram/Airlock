# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Distinct Demo Account Isolation, 12H Countdown with 2H Extension, & Nodemailer SMTP Verification
- **Status**: Completed dynamic data seeding per demo account, live 12-hour countdown timer positioned under the "Airlock" logo with hover popover and silent 2-hour extension approval, and email verification for demo creation via Nodemailer SMTP.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **12H Countdown Timer & 2H Extension**: Embedded [DemoCountdown.tsx](file:///g:/projects/AirLock/apps/web/components/DemoCountdown.tsx) beneath the "Airlock" header logo. Hovering reveals a popover (`Demo account is available for 12 hours`) with a "Request 2-Hour Extension" button that approves silently after ~1.8s and adds +2 hours to the active countdown and session cookie.
- **Nodemailer SMTP Verification**: Created [mailer.ts](file:///g:/projects/AirLock/apps/web/lib/mailer.ts) and [verification.ts](file:///g:/projects/AirLock/apps/web/lib/verification.ts) with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, and `SMTP_FROM_EMAIL` (no-reply) to issue 6-digit verification codes for demo account registration.
- **Distinct Demo Account Data**: Upgraded `ensureDemoOrgSeeded` in [data.ts](file:///g:/projects/AirLock/apps/web/lib/data.ts) with deterministic hashing per email to provide unique ticket numbers, distinct customer triage scopes, distinct token savings, and separate audit streams for each demo evaluator.
- **Navbar Active State & Badge Cleanup**: Created [AppNav.tsx](file:///g:/projects/AirLock/apps/web/components/AppNav.tsx) providing active button highlighting (`bg-slate-900 text-white shadow-xs`) on the current page (`Overview`, `Approvals`, `Audit Trail`, etc.); removed `OPERATOR` badge and `DEMO-USER` org badge from the top navbar.
- **Vercel Corepack Integration**: Configured `corepack enable && pnpm install` in [vercel.json](file:///g:/projects/AirLock/vercel.json) to eliminate lockfile mismatch on cloud deployments.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
