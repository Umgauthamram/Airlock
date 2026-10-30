# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Landing Page Elevation & Post-Auth Control Plane Isolation
- **Status**: Completed Mimir sculpture centering within dedicated hero viewport, polished rounded UI design, automated dashboard redirect for authenticated users, and added comprehensive enterprise security sections.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Prominent Mimir Sculpture Centering**: Encapsulated the hero viewport into its own height-constrained container, scaling and centering the chiseled bust of Mimir directly beside the headline with smooth rounded corners (`rounded-2xl`, `rounded-xl`).
- **Post-Auth Landing Page Bypass**: Added server-side session checks in `page.tsx` that automatically redirect authenticated and 12-hour demo users straight to the dashboard (`/app`).
- **Control Plane Isolation**: Removed internal control plane cards from the public landing page, keeping management endpoints protected behind active sessions.
- **Rich Technical Landing Sections**: Added 5 new high-impact product sections: (1) 3-Step Pre-Execution Pipeline, (2) Enterprise Threat Matrix covering 6 attack vectors, (3) Multi-Turn vs. Script Mode benchmark table, (4) 60-Second Client Setup (Cursor & Claude), and (5) Interactive Technical FAQ.
- **Pure Midnight Theme**: Retired the light theme switcher, standardizing on the polished dark obsidian aesthetic (`#080c14`) matching the 21st.dev reference.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
