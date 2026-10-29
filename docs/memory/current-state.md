# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Landing Page Redesign & Quick Start Migration
- **Status**: Completed Vignette Bloom Canvas2D effect, Value-Driven Landing Page, and Step-by-Step Quick Start Guide

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Vignette Bloom Canvas2D Component**: Built interactive Canvas2D raster effect (`apps/web/components/VignetteBloomCanvas.tsx`) with wave animation, bloom glow, vignette gradient, and live interactive mode toggles (mosaic, characters, dots, matrix, cross).
- **Professional Landing Page Redesign**: Removed internal tech jargon ("Deterministic Pre-Execution Inspection"), focused copy strictly on what Airlock provides, team benefits, and live website capabilities.
- **Dedicated Quick Start Guide**: Created `/quickstart` with 3 core subdivisions: (1) Add Airlock Gateway MCP Endpoint, (2) Core Gateway operations, (3) Client configs (Cursor, Claude Desktop, Python, TypeScript). Retired legacy `/docs`.
- **Closed Sandbox Escape & Hardened Executor**: Blocked prototype/constructor traversal in `@airlock/analyzer` (computed literals, template literals, global primitive member access) and scrubbed host globals/primitives in `executor.ts`.
- **Live Nemotron Runtime Wired**: Connected Nemotron Nano (risk explanations), Super (script synthesis and Reference Agent execution), and Ultra (script repair) at runtime via Nebius Token Factory.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
