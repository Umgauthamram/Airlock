# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Phase 3 Complete -> Hackathon Core Delivery Verified
- **Status**: Hackathon Slice (Phases 0, 1, 2, 3) 100% Complete & Verified

## 3. Recent Progress (Rolling Snapshot - Max 5)
- Connected live Nebius API key: verified active Token Factory endpoints with live `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` completions, reasoning trace extraction, and Nebius ConTree Sandboxes client
- Completed Poppins typography, full-screen width, and balanced left/right grid layouts across all web pages
- Built and validated reproducible benchmark harness `@airlock/bench` (`pnpm bench`) over 60 scenarios (30 attacks + 30 benign): **100% block rate, 0% false holds, 94.7% token reduction, 1.26ms p95 latency**
- Added benchmark results view (`/app/results`) and drafted legal pages (`/terms`, `/privacy`)
- Completed comprehensive `FEEDBACK.md`, updated `README.md`, and recorded ADR `0004-empirical-benchmark-and-token-reduction-proof.md`

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
