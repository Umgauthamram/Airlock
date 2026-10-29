# Project Tasks & Milestones

## Active Tasks
- [x] Phase 0: Foundations & Spikes
  - [x] Establish pnpm monorepo layout (`apps/web`, `packages/shared`, `infra/`)
  - [x] Add Apache-2.0 `LICENSE`, `FEEDBACK.md`, and `README.md`
  - [x] Setup Redis Stack Compose definition (`infra/docker-compose.yml`)
  - [x] Implement `@airlock/shared` (key builders with `{orgId}` hash tags, role hierarchies, Zod schemas)
  - [x] Record initial ADR `0001-monorepo-and-redis-cluster-affinity.md`
- [ ] Phase 1: Gateway Core
  - [ ] Implement `@airlock/analyzer` (AST parser, allowed syntax subset, static call extraction, anti-aliasing rules)
  - [ ] Implement `@airlock/policy` (deterministic evaluation, tag-based rules, precedence, explainability)
  - [ ] Implement `@airlock/mocks` (mock MCP servers: inbox with prompt injection, tickets, external http sink)
  - [ ] Implement `apps/gateway` (agent API key auth, streamable MCP endpoints: `search_tools`, `run_script`, `get_result`)
  - [ ] Implement sandbox executor & tool proxy with runtime call-set validation
  - [ ] Implement atomic approvals, audit streams (`org:{orgId}:stream:audit`), budgets, and kill switch
- [ ] Phase 2: Control Plane (Next.js Web App)
  - [ ] Auth.js v5 Google OAuth & Demo authentication
  - [ ] Role-based access control (Admin, Operator, Viewer) data-access layer
  - [ ] Approvals queue, audit explorer, agents, tools, and policy viewer UI
- [ ] Phase 3: Demo, Proof, Benchmark & Submission
  - [ ] Nebius Token Factory reference agent (Nemotron Super / Ultra)
  - [ ] Reproducible benchmark suite (`pnpm bench`)
  - [ ] Landing page & demo mode with seeded data

## Backlog
- [ ] Phase 4: Production hardening (taint tracking, canary credentials, secret rotation)
- [ ] Phase 5: Multi-tenant workspace switching & Slack/Teams approval integrations
