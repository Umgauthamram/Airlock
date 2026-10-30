# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Recreate "mimir" Mosaic ASCII Effect & Seamless Right-Side Integration
- **Status**: Completed Canvas2D Mimir mosaic render pipeline with ripple animation, chromatic aberration, vignette, and seamless edge blending into the left-side text column.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Mimir Canvas2D Effect (`MimirAsciiCanvas.tsx`)**: Recreated the exact 21st.dev "mimir" recipe with 13px cell mosaic grid, chiaroscuro classical bust generator, ripple wave animation (speed: 98, intensity: 60), chromatic aberration (15), and edge vignette (38).
- **Seamless Left-Right Architecture**: Positioned the animated Mimir sculpture on the right side of the landing page, with texts and CTA on the left, connected via a smooth horizontal opacity mask that removes all borders or seams.
- **Dynamic Palette Support**: Enabled direct toggle between Mimir Dark (`#080c14`) and Sage Light (`#e6ece6`), with unified background and tile shading in both themes.
- **Poppins Typography & Full-Width Layout**: Bound Google Poppins via `<link>` and Tailwind theme across the entire application, eliminating serif font fallbacks and ensuring full-width responsive displays on all dashboard and approval views.
- **Nebius Sandboxes Integration**: Wired Nebius Sandboxes microVM execution engine into `packages/nebius` and `apps/gateway`, surfacing microVM isolation telemetry in the operator review UI.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
