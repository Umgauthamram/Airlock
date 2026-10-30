# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: White Landing Page Theme & Direct Google OAuth Redirect
- **Status**: Updated landing page to clean white background (`bg-white`), routed "Sign in with Google" directly to the real Google OAuth consent screen (`accounts.google.com`), removed mock account chooser modal, and eliminated the 12-hour demo copy string.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **High-Contrast Emerald Accents**: Replaced `bg-emerald-50` and `text-emerald-700` across landing page badges, step indicators, inline code tags, and pills with higher-contrast `bg-emerald-200` and `text-emerald-900`.
- **White Top Floating Navbar**: Styled the floating top navigation bar (`Pipeline`, `Quick Start`, `Sign In`) with a clean white background (`bg-white backdrop-blur-md`), slate border (`border-slate-200`), shadow, and high-contrast dark text (`text-slate-700 hover:text-slate-950`).
- **White Landing Page Background**: Transitioned landing page from dark `#0f172b` to crisp white (`bg-white`, `bg-slate-50`, `text-slate-900`, `text-slate-600`, slate borders) with high-contrast sections and tables.
- **Direct Real Google OAuth**: Connected all "Sign in with Google" triggers directly to `/api/auth/google`, redirecting to `https://accounts.google.com/o/oauth2/v2/auth` with configured client credentials.
- **Removed Mock Account Chooser**: Eliminated the interactive mock "Choose Google Account" modal from `/login`.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
