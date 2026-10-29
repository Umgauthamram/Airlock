# Project Tasks & Milestones

## Active Tasks
- [x] Phase 0: Foundations & Spikes
  - [x] Establish pnpm monorepo layout (`apps/web`, `packages/shared`, `infra/`)
  - [x] Add Apache-2.0 `LICENSE`, `FEEDBACK.md`, and `README.md`
  - [x] Setup Redis Stack Compose definition (`infra/docker-compose.yml`)
  - [x] Implement `@airlock/shared` (key builders with `{orgId}` hash tags, role hierarchies, Zod schemas)
  - [x] Record initial ADR `0001-monorepo-and-redis-cluster-affinity.md`
- [x] Phase 1: Gateway Core
  - [x] Implement `@airlock/analyzer` (AST parser, allowed syntax subset, static call extraction, anti-aliasing rules)
  - [x] Implement `@airlock/policy` (deterministic evaluation, tag-based rules, precedence, explainability)
  - [x] Implement `@airlock/mocks` (mock MCP servers: inbox with prompt injection, tickets, external http sink, 50+ tool generator)
  - [x] Implement `apps/gateway` (agent API key auth, streamable MCP endpoints: `search_tools`, `run_script`, `get_result`)
  - [x] Implement sandbox executor & tool proxy with runtime call-set validation
  - [x] Implement atomic approvals, audit streams (`org:{orgId}:stream:audit`), budgets, and kill switch
  - [x] Pass end-to-end command-line exit test suite across all packages
  - [x] Record ADR `0002-deterministic-script-gating-and-sandbox-proxy.md`
- [x] Phase 2: Control Plane (Next.js Web App)
  - [x] Design token & typography setup (`Source Serif 4`, `IBM Plex Sans`, `IBM Plex Mono`, warm paper theme)
  - [x] Authentication & Session management (`lib/auth.ts`, Demo login `/api/auth/demo`, Google OAuth scaffold)
  - [x] Server-side RBAC data-access layer (`requireSession`, `requireRole`)
  - [x] App screens: Overview Dashboard (`/app`), Approvals Queue (`/app/approvals`), Script Inspection & Decision (`/app/approvals/[id]`), Audit Stream Explorer (`/app/audit`), Agents & Kill Switch (`/app/agents`), Tools Registry (`/app/tools`), Policies Viewer (`/app/policies`)
  - [x] Public landing page (`/`), Login (`/login`), Documentation (`/docs`), Request Access (`/request-access`)
  - [x] Verified full Next.js production build (`next build`)
  - [x] Record ADR `0003-control-plane-rbac-and-demo-isolation.md`
- [ ] Phase 3: Demo, Proof, Benchmark & Submission
  - [ ] Implement `@airlock/nebius` Token Factory client (OpenAI-compatible client with usage tracking for Nano, Super, Ultra)
  - [ ] Implement `@airlock/agent-ref` (reference agent in classic multi-turn mode vs Airlock script mode)
  - [ ] Implement `@airlock/bench` (reproducible benchmark harness `pnpm bench` with 30 attack + 30 benign scenarios)
  - [ ] Benchmark results display & documentation
  - [ ] Final submission verification checklist

## Backlog
- [ ] Phase 4: Production hardening (taint tracking, canary credentials, secret rotation)
- [ ] Phase 5: Multi-tenant workspace switching & Slack/Teams approval integrations
