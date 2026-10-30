# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: UI Polish (Poppins, Full Screen, Left-Right Split) & Nebius Sandboxes Integration
- **Status**: Completed full screen responsive layouts, guaranteed Poppins typography across all routes, and integrated Nebius Sandboxes microVM isolation.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Poppins Typography & Full-Width Layout**: Bound Google Poppins via `<link>` and Tailwind theme across the entire application, eliminating serif font fallbacks and ensuring full-width responsive displays on all dashboard and approval views.
- **Left-Right Component Architecture**: Restructured the Approval detail view and Dashboard into side-by-side split panels (left: Code Inspector & Policy Alert; right: Operator Decision, Metadata, and Execution Environment).
- **Nebius Sandboxes Integration**: Wired Nebius Sandboxes microVM execution engine into `packages/nebius` and `apps/gateway`, surfacing microVM isolation telemetry in the operator review UI.
- **Pencil Reference Landing Page**: Aligned the hero section with the pencil aesthetic (sage/mint `#e6ece6`, forest green `#0b3320`, full ASCII bust silhouette canvas with Vignette Bloom wave effects, and floating preview card).
- **Comprehensive Verification**: All 10 workspace packages built with zero errors, and all monorepo test suites passed 100%.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
