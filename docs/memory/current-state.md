# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Google-Only Dedicated Demo Allocation, Strict Dark Landing Theme & Light Mode App
- **Status**: Completed Google-only authentication workflow with instant 12-hour demo allocation by email, strict dark mode landing page (`#0f172b`), normal light mode app pages (`#f8fafc`), and authenticated dashboard auto-redirect.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Google-Only Sign-In & Dedicated Demo Allocation**: Removed email/password inputs and waitlist requests; users sign in via Google and receive an instantly provisioned 12-hour demo environment keyed to their email (`demo_<email>`).
- **Strict Theme Segregation**: Standardized landing page strictly on dark mode (`#0f172b`) with polished rounded geometry and centered Mimir sculpture; all other pages (`/app/*`, `/login`, `/quickstart`) operate in clean light mode (`#f8fafc`).
- **Post-Auth Landing Page Bypass**: Added server-side session checks in `page.tsx` that automatically redirect authenticated and 12-hour demo users straight to the dashboard (`/app`).
- **Control Plane Isolation**: Protected control plane operations behind authenticated sessions with per-org Redis sandboxing.
- **Rich Technical Landing Sections**: Added 5 technical product sections (Pre-Execution Pipeline, Enterprise Threat Matrix, Benchmark Comparison, 60s Client Setup, Interactive FAQ).

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
