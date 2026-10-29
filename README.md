# Airlock

> **A production gateway that inspects, gates, and audits agent-written scripts before execution.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Airlock sits between AI agents and upstream MCP (Model Context Protocol) tool servers. Instead of allowing an agent to call tools step-by-step in multi-turn round trips where malicious intent is hidden across steps, Airlock has the agent submit a plan as a concise script. Airlock deterministically analyzes the script's AST, enforces data-flow policies, holds suspicious actions for human operator approval, executes approved code in an isolated sandbox, and records every step in an append-only audit log.

---

## Key Features

- **Pre-execution Plan Inspection**: Deterministic AST analysis extracts every tool invocation and rejects dynamic evasion tricks (`eval`, aliasing, dynamic dispatch).
- **Deterministic Policy Engine**: Versioned rules over semantic tool tags (`reads_untrusted`, `writes_external`, `destructive`) with strict precedence (`deny` > `hold` > `allow`). Fail closed by default.
- **Human-in-the-Loop Approvals**: Real-time approval queue with RBAC (Admin, Operator, Viewer) and single-click decision flows.
- **Token Reduction**: Replaces dozens of back-and-forth tool descriptions with targeted tool search stubs, drastically cutting token expenditure.
- **Sandboxed Execution & Tool Proxy**: Host-bridged execution isolate where every tool call is validated against the approved set at runtime before reaching upstream servers.
- **Immutable Audit Trail**: Append-only Redis Stream recording every request, policy evaluation, human approval, tool proxy call, and admin action.

---

## Monorepo Architecture

```
airlock/
  apps/
    web/          # Next.js 16 (App Router) control plane & dashboard
    gateway/      # Node.js service: MCP endpoint, approvals, worker execution
  packages/
    shared/       # Types, Redis key builders, zod schemas, role definitions
    analyzer/     # AST parsing & syntax validation (pure, no I/O)
    policy/       # Deterministic rule evaluation (pure, no I/O)
    nebius/       # Nebius Token Factory client & token accounting
    agent-ref/    # Reference agent: classic mode vs code mode
    mocks/        # Mock MCP servers & attack fixtures
    bench/        # Benchmark harness (pnpm bench)
  infra/          # Docker Compose (Redis Stack), Caddyfile, index setup
  docs/memory/    # Veeshree architectural context & ADRs
```

---

## Quickstart

### Prerequisites
- Node.js >= 22
- pnpm >= 10
- Docker & Docker Compose (for local Redis Stack)

### Local Setup
```bash
# Clone the repository
git clone https://github.com/your-org/airlock.git
cd airlock

# Install dependencies
pnpm install

# Start local Redis Stack (RediSearch + RedisJSON)
docker compose -f infra/docker-compose.yml up -d

# Run web app
pnpm dev:web
```

---

## Submission & Feedback

Built for the **Nebius x NVIDIA Global AI Hackathon** (Coding & Agentic Engineering track). See [`FEEDBACK.md`](FEEDBACK.md) for continuous developer notes on Nebius Token Factory and NVIDIA Nemotron models.

---

## License

Apache License 2.0. See [`LICENSE`](LICENSE) for details.
