# Airlock

> **Pre-execution security gateway that inspects, gates, and audits agent-written scripts before execution.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Airlock sits between autonomous AI agents and upstream MCP (Model Context Protocol) tool servers. Instead of allowing an agent to call tools step-by-step in multi-turn round trips where malicious intent is concealed across steps, Airlock requires the agent to submit its plan as a concise JavaScript script. Airlock deterministically analyzes the script's AST, enforces data-flow security policies, holds prompt-injection exfiltration attempts for human operator approval, executes approved code in a hardened sandbox, and records every step in an immutable audit trail.

---

## Measured Benchmark Results (`pnpm bench`)

Tested against a comprehensive corpus of **62 benchmark scenarios** (31 attack scenarios + 31 benign scenarios) across an expanded catalog of **50 realistic MCP tools** spanning 8 services (`crm`, `cloud`, `db`, `analytics`, `slack`, `github`, `billing`, `calendar`):

| Metric | Result | Target / Baseline |
| :--- | :--- | :--- |
| **Attack Block / Hold Rate** | **100%** (31 / 31) | 100% |
| **Benign False-Hold Rate** | **0.0%** (0 / 31) | &lt; 5% |
| **Average Token Reduction** | **99.5%** | &gt; 60% |
| **Total Tokens Consumed** | **3,441** vs **628,400** | 99.5% savings (estimated) |
| **AST Analysis Latency (p50)** | **0.15 ms** | &lt; 20 ms |
| **AST Analysis Latency (p95)** | **0.69 ms** | &lt; 50 ms |

To reproduce these metrics on your local machine:
```bash
pnpm bench
```

---

## Nebius Token Factory & NVIDIA Nemotron Integration

Airlock leverages Nebius Token Factory with specialized model tier assignments:
- **`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`**: Background semantic tagging of discovered MCP tools and concise operator explanations for held scripts.
- **`nvidia/nemotron-3-super-120b-a12b`**: Primary agent plan generator, synthesizing structured JavaScript scripts from natural language intents.
- **`nvidia/Nemotron-3-Ultra-550b-a55b`**: Complex policy evaluation explainability and single-attempt AST script repair.

See [`FEEDBACK.md`](FEEDBACK.md) for our running feedback on Nebius Token Factory and NVIDIA tooling.

---

## Core Security Features

1. **Deterministic AST Inspection (`@airlock/analyzer`)**:
   - Parses code with Acorn to enforce an allowed language subset.
   - Strictly bans `eval`, `Function`, `import`, `process`, `globalThis`, and prototype properties (`__proto__`, `constructor`, `prototype`).
   - Enforces the **`tools` rule**: `tools` can *only* appear in the shape `tools.<server>.<tool>(...)`. Aliasing (`const t = tools`), destructuring, dynamic indexing (`tools[s][t]()`), or passing as an argument is denied at analysis time.
2. **Deterministic Data-Flow Policy (`@airlock/policy`)**:
   - Classifies tools with semantic tags: `reads_untrusted`, `reads_private`, `writes_external`, `writes_internal`, `destructive`.
   - Strict precedence: `DENY` > `HOLD` > `ALLOW`.
   - Halts prompt-injection exfiltration attacks (`reads_untrusted -> writes_external`) before execution.
3. **Sandboxed Execution & Runtime Tool Proxy (`apps/gateway`)**:
   - Executes code in an isolated ECMAScript context with resource and timeout bounds.
   - The tool proxy validates each tool call at runtime against the pre-approved call set from static analysis before reaching upstream servers.
4. **Human-in-the-Loop Approvals & RBAC (`apps/web`)**:
   - Review queue with visual risk flows, script inspection, and one-click approve/deny.
   - Enforces server-side roles: `Viewer` < `Operator` < `Admin`.
   - Isolated Demo Mode (`org:demo`) for instant 1-click evaluation.

---

## Monorepo Architecture

```
airlock/
  apps/
    web/          # Next.js 16 (App Router) control plane, approvals, & audit UI
    gateway/      # Node.js service: Streamable MCP server, sandbox executor, Redis streams
  packages/
    shared/       # Cluster-slot Redis key builders, RBAC, Zod schemas
    analyzer/     # Acorn AST parser & syntax subset validator (pure, no I/O)
    policy/       # Deterministic policy engine with precedence (pure, no I/O)
    mocks/        # Mock MCP servers, prompt-injection attack fixtures, 50+ tool catalog
    nebius/       # Nebius Token Factory client & token usage accounting
    agent-ref/    # Reference agent: classic mode vs Airlock script mode
    bench/        # Reproducible benchmark suite (pnpm bench)
  infra/          # Docker Compose (Redis Stack), deployment configs
  docs/memory/    # Veeshree context persistence & ADRs
```

---

## Quickstart

### Prerequisites
- Node.js >= 22
- pnpm >= 10
- Docker & Docker Compose (for local Redis Stack)

### Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-org/airlock.git
cd airlock

# 2. Install dependencies
pnpm install

# 3. Start local Redis Stack (JSON + RediSearch)
docker compose -f infra/docker-compose.yml up -d

# 4. Run full test suite across all packages
pnpm -r test

# 5. Run reproducible benchmark suite
pnpm bench

# 6. Start the web control plane
pnpm dev:web
```
Visit `http://localhost:3000` and click **"Explore the Demo"** to access the operator control plane.

---

## License

Apache License 2.0. See [`LICENSE`](LICENSE) for details.
