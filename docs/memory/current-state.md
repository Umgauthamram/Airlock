# Current Project State

## 1. System Overview & Purpose
- **Project Name**: AirLock
- **Active Branch**: `main`
- **Detected Stack & Architecture**: TypeScript pnpm Monorepo (Next.js 16 App Router web app, Node.js gateway/worker, Redis Stack / Redis Cloud with JSON & Streams)
- **Primary Purpose**: Pre-execution security gateway and deterministic policy enforcer for AI agents calling MCP tools
- **Languages**: TypeScript / Node.js

## 2. Active Feature / Milestone
- **Current Focus**: Real Runtime Tavily Search API Integration & 64-Scenario Benchmark Expansion
- **Status**: Implemented Tavily as a real, host-executed tool (`tavily.web_search`) in `apps/gateway/src/tools/tavily.ts` with strict timeout, fail-closed configuration, and full audit stream logging. Registered `tavily.web_search` with tag `reads_untrusted` in `packages/mocks/src/tools.ts`, passing policy unit tests (allowed alone, held when paired with external write sinks under Rule R1). Added Scenario C "Research Agent (Powered by Tavily)" to the UI with live search results preview. Expanded benchmark corpus to 64 scenarios (32 attack + 32 benign) with 100% attack blocking (32/32) and 99.4% token reduction.

## 3. Recent Progress (Rolling Snapshot - Max 5)
- **Tavily Real Runtime Tool**: Added `apps/gateway/src/tools/tavily.ts` executing `https://api.tavily.com/search` strictly on the gateway host; secrets never reach the sandbox worker. Added fail-closed startup validation in `server.ts` and audit logging for every Tavily search.
- **Tavily Policy Unit Testing & Catalog Tagging**: Added `tavily.web_search` to tool catalog with `reads_untrusted` tag; verified policy engine permits web search alone (`allow`) and holds exfiltration when chained with external egress (`hold`, Rule R1).
- **Web UI Research Agent Scenario & "Powered by Tavily"**: Added interactive Scenario C to `FeatureGuide.tsx` and `/api/demo/simulate` allowing users to trigger real-time Tavily queries with live answer/source preview and demonstrate Airlock holding untrusted web exfiltration.
- **Benchmark Suite Expanded (64 Scenarios)**: Added `atk_32` and `ben_32` to `packages/bench/src/corpus.ts`; refreshed `benchmark-results.json` and aligned numbers in `README.md` and `apps/web/app/app/results/page.tsx` (100% attack block, 32/32 prevented, 99.4% token savings).
- **Devpost Submission Answers Updated**: Completed `things to fill.md` with humanized, accurate details regarding Nemotron tiers, Nebius Token Factory acceleration, and the functional Tavily runtime implementation.

## 4. Next Immediate Steps
- [ ] Review live local test run (`pnpm -r test` & `pnpm bench`) with user
- [ ] Ready for deployment and demo video recording
