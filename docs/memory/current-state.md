# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Multi-Modal Auth (Google + Email) & 5-Min Auto-Approved 12-Hour Demo License
- **Status**: Completed dual Sign In / Sign Up flows, interactive Google Account chooser, 5-minute automated compliance countdown with live ticker, fast-track bypass, and 12-hour session issuance.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Login & Signup Architecture (`/login`, `/signup`)**: Implemented dedicated Sign In / Sign Up tabs with Google authentication, interactive Google Account Chooser dialog, and email/password forms.
- **Demo Request Engine (`/demo-request`, `lib/demo-requests.ts`)**: Structured the user onboarding flow to collect organization and evaluation scope, auto-approving after 5 minutes and issuing a 12-hour Operator pass.
- **Live 5-Minute Countdown Screen**: Built an animated countdown timer (`04:59` -> `00:00`) with circular SVG progress ring, background status polling, and an instant Fast-Track button for hackathon evaluators.
- **12-Hour Session Expiration**: Configured session cookies and Redis tracking for 12-hour validity (`12 * 60 * 60 * 1000`), highlighted with a "12H Demo Pass" navigation badge in `/app`.
- **Mimir Canvas2D Effect (`MimirAsciiCanvas.tsx`)**: Recreated the exact 21st.dev "mimir" recipe with 13px cell mosaic grid, chiaroscuro classical bust generator, ripple wave animation, chromatic aberration, and seamless edge blending.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
