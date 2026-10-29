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
- [ ] Phase 2: Control Plane (Next.js Web App)
  - [ ] Auth.js v5 Google OAuth & Demo credentials authentication
  - [ ] Server-side role enforcement (Admin, Operator, Viewer) data-access layer
  - [ ] App screens: Approvals queue (`/app/approvals`), Audit explorer (`/app/audit`), Dashboard (`/app`), Agents (`/app/agents`), Tools catalog (`/app/tools`), Policies viewer (`/app/policies`)
- [ ] Phase 3: Demo, Proof, Benchmark & Submission
  - [ ] Nebius Token Factory reference agent (Nemotron Super / Ultra)
  - [ ] Reproducible benchmark suite (`pnpm bench`)
  - [ ] Landing page & demo mode with seeded data

## Backlog
- [ ] Phase 4: Production hardening (taint tracking, canary credentials, secret rotation)
- [ ] Phase 5: Multi-tenant workspace switching & Slack/Teams approval integrations
