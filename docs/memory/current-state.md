# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Dedicated Email Demo Allocation, Underscore Removal & UI Cleanup
- **Status**: Implemented dedicated email display for allocated demo sessions, removed "12H Demo Pass" badge, and replaced all underscore words across approvals, audit trail, policies, tools, and agents with clean typography and formatting.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **User Email in Demo Allocation**: Authenticated user emails (e.g. `alex.developer@gmail.com`) are now bound to demo sessions and prominently displayed in the top navbar instead of placeholder emails.
- **Removed 12H Demo Pass Badge**: Completely eliminated the "12H Demo Pass" badge from the application header.
- **Zero-Underscore Display Typography**: Built and integrated universal formatting helpers (`cleanUnderscores`, `formatFlowTag`, `formatEventType`) across approvals, audit, agents, policies, and tools to eliminate all displayed underscores (e.g. `appr-demo-prompt-injection`, `reads untrusted → writes external`, `agent-nemotron-super`).
- **Strict Theme Segregation**: Standardized landing page strictly on dark mode (`#0f172b`) with polished rounded geometry and centered Mimir sculpture; all other pages (`/app/*`, `/login`, `/quickstart`) operate in clean light mode (`#f8fafc`).
- **Post-Auth Landing Page Bypass**: Added server-side session checks in `page.tsx` that automatically redirect authenticated and demo users straight to the dashboard (`/app`).

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
