# 1. Monorepo Structure and Redis Cluster Slot Affinity

Date: 2026-10-29
Status: Accepted

## Context
Airlock coordinates a control plane (Next.js web application for operators and administrators) and a data plane (Node.js gateway/worker executing in a hardened VM environment with Redis JSON/Streams). The architecture must support multi-tenant data isolation (`org_id`) with atomic transactions in Redis across related entities (e.g., approvals, jobs, audit events) using Lua scripts.

## Decision
1. **pnpm Monorepo**: Use a pnpm workspace with `apps/` (`web`, `gateway`) and `packages/` (`shared`, `analyzer`, `policy`, `nebius`, `agent-ref`, `mocks`, `bench`).
2. **Redis Hash Tags for Cluster Affinity**: Format every Redis key as `org:{<orgId>}:<type>:<id>`. The `{orgId}` curly braces define the Redis hash tag, guaranteeing that all keys belonging to a single organization hash to the same cluster slot. This permits cross-key atomic Lua operations (`budget_consume`, `approval_decide`, `invite_consume`).
3. **Pure JS Packages**: Packages like `@airlock/shared`, `@airlock/analyzer`, and `@airlock/policy` are pure TypeScript/JavaScript with zero native compilation dependencies, ensuring portability across Windows, Linux, and serverless environments.

## Consequences
- Guaranteed atomicity for approval transitions and budget deduction per organization.
- Straightforward local orchestration using Redis Stack (`redis/redis-stack`) and easy migration to multi-node Redis Cloud clusters without key migration or slot-crossing script failures.
