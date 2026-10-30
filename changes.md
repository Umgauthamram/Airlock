# Changelog & Security Audit Resolution

This document tracks security remediations, architectural hardening, and feature updates across the Airlock monorepo.

---

## [Release Hardening] - 2026-10-30

### Security & Sandbox Isolation
- **Worker Thread Execution Boundary (F-01, F-04, C-01, H-01)**:
  - Migrated untrusted JavaScript execution from in-process evaluation to isolated Node.js `worker_threads` Workers.
  - Implemented realm prototype scrubbing and freezing (`Object.prototype.constructor`, `Function.prototype.constructor`, `AsyncFunction.prototype.constructor`) to block prototype traversal.
  - Serialized all inputs and outputs across the boundary via JSON strings to ensure zero host-realm object leakage.
  - Added parent-process kill timers (`worker.terminate()`) terminating any run exceeding configured timeout (DoS prevention).
  - Enhanced AST analyzer (`@airlock/analyzer`) to statically ban chained computed member access and computed invocations.
- **Fail-Closed Secrets Management (F-02, F-03, A-02, C-05)**:
  - Enforced strict production startup validation: both web and gateway services immediately halt if `AUTH_SECRET` or `AIRLOCK_MASTER_KEY` are unset, default, or shorter than 32 characters.
  - Switched master key validation to constant-time `crypto.timingSafeEqual`.
  - Cleared working default secrets from `.env.example`.
- **RBAC & OAuth Hardening (F-05, F-16, C-02)**:
  - New Google OAuth accounts default to `Role.VIEWER`.
  - Enforced `profile.email_verified === true` and optional `ALLOWED_EMAIL_DOMAIN` hosted domain filtering.
  - Preserved existing user roles in Redis to prevent role resets or accidental reactivation of deactivated accounts.
  - Enforced cryptographic HMAC-signed and timestamped `state` tokens in OAuth callbacks.
- **Demo Mode Isolation & Rate Limiting (F-06, F-17, F-18, C-03, C-04)**:
  - Disabled unverified demo login endpoints.
  - Enforced strict single-email RFC regex validation and rate limiting (max 3 requests per 10 min, max 5 failed code attempts).
  - Restricted demo session extensions to a hard 16-hour total lifetime cap.
  - Seeded demo org IDs with full email SHA-256 hashes to prevent prefix collisions across domains.

### Policy Engine & Gateway Core
- **Policy Fail-Closed Rule (F-10)**: Added rule `R6` denying any script that invokes tools not registered in the approved tool catalog.
- **Atomic Approval Claims (F-07, M-05)**: Implemented atomic Redis `SETNX` locking on pending approval claims, eliminating concurrent decision race conditions.
- **Expired Approval Handling (F-08)**: Gateway explicitly rejects expired approval decisions before sandbox execution.
- **Error Propagation (F-09)**: Execution failures and timeouts correctly propagate to callers and audit logs.
- **Audit Stream Ordering (F-23)**: Switched Redis stream queries from `xrange` to `xrevrange` so audit streams present newest events first.
- **MCP Protocol Handshake (F-24)**: Added standard `initialize` and `notifications/initialized` handlers to `POST /mcp`.

### Infrastructure & Deployment
- **Caddy Reverse Proxy (F-14, H-02)**: Configured `infra/Caddyfile` with reverse proxy routing, rate limits, and security headers (`X-Frame-Options DENY`, `X-Content-Type-Options nosniff`).
- **Container Hardening (F-14, H-03, C-06)**: Pinned `pnpm@9.15.4` and Node 22 in `apps/gateway/Dockerfile`, executing under unprivileged `USER node`.
- **Local Network Isolation**: Bound Redis ports to `127.0.0.1` in `infra/docker-compose.yml`.
- **Automated CI (F-15)**: Added GitHub Actions workflow (`.github/workflows/ci.yml`) running frozen dependency installation, monorepo builds, and tests on every push.
- **Vercel Build Configuration**: Pinned `pnpm@9.15.4 --frozen-lockfile` in `apps/web/vercel.json`.

### Documentation & Benchmarks
- **Truthful Architecture Claims (A-01, F-12)**: Replaced references to microVMs with "Hardened Sandboxed Worker Isolation".
- **Benchmark Consistency (A-03, F-11)**: Aligned empirical numbers across README and UI: 62 scenarios (31 attacks, 31 benign), 100% attack block/hold rate, 0% false holds, 99.5% token reduction, and 0.69ms p95 AST latency.
- **Repository Setup (A-04, A-05, A-09)**: Fixed clone URL, aligned pnpm version to 9.15.4, added `engines` field to `package.json`, and added `.nvmrc`.
