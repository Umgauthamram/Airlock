# Airlock: Implementation Plan

Draft v0.1 · October 29, 2026 · Companion to the PRD and TRD

## 1. How to read this plan

Phases 0 to 3 make up the hackathon slice. Phases 4 and 5 are the production roadmap after submission. Every phase has an exit test, so you always know whether it is actually done.

**Deadline.** Submissions close October 30, 2026 at 10:00 AM PDT, which is about 10:30 PM IST. Confirm on Devpost. This plan uses time blocks counted from when you start, not clock times, because the time you have left depends on when you read this.

**Effort estimates.** They assume two engineers working in parallel: Engineer A on the gateway and Engineer B on the web app. They are rough planning numbers, not measurements. If you are solo, or have less time than the blocks add up to, apply the cut line in section 7 immediately instead of discovering it at the end.

## 2. Phase 0: Foundations and spikes (about 2 hours, both engineers)

**Setup**

- Create the pnpm monorepo from the TRD layout. Add `LICENSE` (Apache-2.0 proposed) at the top level, a README skeleton, and `FEEDBACK.md`. Start logging Token Factory and NVIDIA tooling feedback now, because it is a submission requirement and is painful to reconstruct later.
- Local `docker-compose.yml` with Redis Stack.
- `packages/shared`: Redis key builders (always including `org_id`), zod schemas, role helpers.
- Accounts and resources: Redis Cloud database with JSON and Search, a Google OAuth web client, a Vercel project, a Nebius VM with Docker, a Token Factory API key, and DNS for `app.` and `gateway.` subdomains (Caddy needs a real hostname for automatic TLS).

**Spikes (each timeboxed to 30 minutes)**

- Token Factory: call `GET /v1/models`, make one chat call per tier with the exact parameters you plan to use, and check which embedding model exists. Record results.
- Isolate: run a script with a bridged async host function in `isolated-vm` and in `quickjs-emscripten` on the VM. Pick one and note why.
- MCP: a hello-world Streamable HTTP server with the official SDK, called from an MCP client.
- Redis Cloud: create the vector index and run one query.

**Exit test.** A stub `/mcp` endpoint accepts a script, parses it, runs it in the chosen isolate, and the model call works. Decisions are recorded in the README or an ADR file.

## 3. Phase 1: Gateway core (about 6 hours, Engineer A)

This is the product. Do it first and do it well.

1. **Analyzer** (`packages/analyzer`): parse, enforce the syntax subset, the `tools` rule, and extract calls. Write the adversarial corpus alongside it.
2. **Policy engine** (`packages/policy`): tags, rules, precedence, reasons, versioning. Table-driven tests.
3. **Tool registry and mocks** (`packages/mocks`): servers for `inbox` (with injection fixtures), `tickets`, `http` (external write that logs to a sink), and `files`. A generator that adds filler tools to reach about 50 for the benchmark. Seed tags as confirmed.
4. **MCP endpoint**: agent API key auth (keys created by a seed script until the UI exists), `search_tools`, `run_script`, `get_result`.
5. **Executor**: isolate, host-function tool proxy with the approved-set check, limits, size caps, per-call audit events.
6. **Approvals**: approval documents, the `approval_decide` Lua script, the jobs stream and consumer group, the dead-letter stream, 24-hour expiry.
7. **Audit stream** and **budgets and rate limits** (`budget_consume` Lua).
8. **Kill switch** check on every request.

**Exit test (command line only).** A benign script runs. A script that reads the injected email and posts to the HTTP tool is held. Approving it through a CLI helper runs it once. A second approval attempt does nothing. Every step appears in the audit stream. The adversarial corpus is fully rejected or contained.

## 4. Phase 2: Control plane (about 5 to 6 hours, Engineer B, starts after Phase 0)

1. **Scaffold.** Next.js App Router, Tailwind, design tokens from the landing brief (warm neutral background, one accent, serif headlines, Plex Sans and Mono), accessible base components. No Lucide icons.
2. **Auth.** Auth.js v5 with Google, the sign-in callback logic from the TRD (invite, bootstrap admin, request-access), Redis user store, session and role freshness.
3. **Authorization layer.** `requireSession()` and `requireRole()` in a data-access module, `orgId` from the session only, last-Admin and self-demotion guards. RBAC test matrix.
4. **App screens**, in this order:
   - Approvals list and detail with approve and deny (the heart of the demo).
   - Audit log with filters and export.
   - Overview dashboard (polling the event feed).
   - Agents: create key (shown once), scopes, budgets, suspend and resume.
   - Tools: list, tag editor with the Nano suggestion shown, confirm.
   - Users: invite, change role, deactivate (Admin).
   - Policies: read-only view first, JSON editor with validation if time allows.
5. **Wire to the gateway.** Decisions go through the same Lua transition the gateway uses.

**Exit test.** Sign in with Google as the bootstrap Admin, invite an Operator by email, sign in as the Operator in another browser, approve a held script from the UI, and see the full chain in the audit page. A Viewer sees no approval controls and gets 403 from the API. An uninvited Google account sees `/request-access` and no data.

## 5. Phase 3: Demo, proof, landing, submission (about 5 hours, both)

1. **Demo mode and seed data.** `DEMO_MODE`, the `demo` org, seeded approvals and audit history, hourly reset job on the VM.
2. **Reference agent and playground.** Nemotron Super writes scripts, Ultra repairs once. Classic mode versus Airlock mode on the same task, with token counts from the API `usage` fields.
3. **Benchmark.** Corpus of at least 30 attacks and 30 benign tasks, the 50-tool catalog, `pnpm bench`, a results page with method and raw data. Report false holds and failures honestly.
4. **Landing, docs, legal.** Build the landing page from the PRD brief using a real screenshot of the approvals screen. Add the quickstart, plus drafted Terms and Privacy pages based on what the app really stores, clearly marked as drafts for review. Fill the results section only with measured numbers.
5. **Deploy.** Vercel for the web app, Compose on the VM with Caddy TLS, environment variables, Redis index script. Smoke test from a clean browser profile and from a phone.
6. **Repository polish.** README with setup steps, architecture, a section on how Nemotron and Token Factory are used (which tier does what), other Nebius services used, license visible at the top, screenshots. Make the repository public.
7. **Demo video (3 minutes or less).** Suggested script:
   - 0:00 to 0:25: the problem, with one real example.
   - 0:25 to 1:15: the attack. A classic agent obeys the hidden instruction.
   - 1:15 to 2:15: the same task through Airlock. The script is held, the flow is shown, the Operator approves a safe variant, and the audit log is shown.
   - 2:15 to 2:50: the benchmark numbers and the Nano, Super, Ultra split.
   - 2:50 to 3:00: where to find the repository and demo. Upload as public on YouTube early, because processing takes time.
8. **Devpost.** Project description (what, why, how), category, demo URL, video, repository, and the written feedback from `FEEDBACK.md`. If any code predates the submission period, add the note about what changed.

**Exit test.** A person who has never seen the project opens the demo URL on a phone, enters demo mode, runs the attack scenario, and reaches the held script without help. The Devpost entry is submitted with at least 60 minutes to spare.

## 6. Suggested time blocks (counted from your start)

- **Block 1 (hours 0 to 2):** Phase 0 together.
- **Block 2 (hours 2 to 8):** Phase 1 (A) and Phase 2 (B) in parallel. Integrate at the end of the block.
- **Block 3 (hours 8 to 13):** Phase 3 together. Deploy early in this block, not at the end.
- **Final 3 hours before the deadline:** feature freeze. Only bug fixes, README, video, and submission.
- **Final 60 minutes:** submitted, then verify the links from an incognito window.

If fewer than 13 hours remain, shorten Block 2 by taking the cut line below.

## 7. Cut line

**Never cut:** analyzer, policy, hold and approve flow, audit log, Google login with Admin, Operator, and Viewer enforcement, deployed demo URL, README, video, Devpost submission.

**Cut in this order when short on time:**

1. Policy editor (keep it read-only).
2. `find_script` and script reuse.
3. Vector search (use Redis full-text search for tool search).
4. Side-by-side playground (keep the benchmark command and the numbers).
5. Tool tag editor UI (confirm tags by seed script and show them read-only).
6. Demo org hourly reset (reset by hand before submission).
7. Landing sections 4 and 5 (shorten to the hero, the example, and the quickstart).

**If solo:** do Phase 0, then Phase 1, then only auth, approvals, and audit from Phase 2 (create agents and users by seed scripts), then Phase 3 with items 1, 5, 6, 7, and 8 plus a short landing page.

## 8. Risks and fallbacks

- **Isolate library will not build or run on the VM.** Use QuickJS WASM, or one locked-down container per script.
- **Redis Cloud plan lacks Search or enough memory.** Use full-text search only, or run Redis Stack on the VM in Compose.
- **Nemotron writes poor scripts.** Add examples to the prompt, return line-level analyzer errors for one Ultra repair attempt, and pick benchmark tasks the model handles reliably (and say so).
- **Token Factory rate limits slow benchmark runs.** Pace requests, run the benchmark as a Serverless Job, and cache results.
- **Google sign-in friction for judges.** Demo mode removes the account requirement.
- **Google consent screen limits.** Publish the consent screen to production status before submission and test with an account that is not on any test list.
- **YouTube processing delay.** Upload the video at least two hours before the deadline.
- **Last-minute deployment failure.** Keep the previous working image tag and a recorded demo video as a fallback.

## 9. Working agreements

- Small pull requests into `main`, with CI green before merge. Feature branches are fine, long-lived ones are not.
- Every P0 item ships with tests, audit events, and a role check test.
- Write an ADR (a few lines) for each decision that was debated: isolate choice, embedding model, any change to the policy format.
- Update `FEEDBACK.md` whenever something about Token Factory or NVIDIA tooling surprises you.

## 10. Phase 4: Production hardening (after submission, 1 to 2 weeks)

- Variable-level taint tracking inside scripts to cut false holds.
- Policy editor with simulation against recorded scripts.
- Secret manager, master-key rotation, and per-tool egress policy management.
- OpenTelemetry traces, SLO dashboards, alerting, and runbooks.
- Redis persistence settings, backups, restore drills, and a high-availability plan.
- Load tests against the latency targets in the PRD. Dependency scanning, an SBOM, and an external security review of the sandbox.
- Data retention controls and deletion workflow.
- Tavily-based domain reputation checks for hosts in script arguments.
- Token Factory Sandboxes as a second execution backend.

## 11. Phase 5: Scale and ecosystem

- Multi-tenant organizations with workspace switching and org-level roles (the `org_id` key convention is already in place).
- Approval notifications and decisions from Slack, Teams, and email.
- TypeScript and Python client SDKs and policy packs for common stacks.
- Detonation mode for untrusted repositories with canary credentials.
- Additional identity providers and SAML for enterprise customers.
- Compliance exports of audit data.

## 12. Submission checklist

- Public repository with Apache-2.0 (or other open-source) license visible at the top, README with setup, and a section on Nemotron, Token Factory, and other Nebius tools used.
- Working demo URL reachable without creating an account.
- Public YouTube video of 3 minutes or less showing the project working and Token Factory with Nemotron in use.
- Project description covering what, why, and how.
- Category selected: Coding and Agentic Engineering.
- Written feedback on Token Factory, AI Cloud, and any NVIDIA tools used.
- Note on what changed during the submission period, if any code existed earlier.
- All links verified from an incognito window and a phone.
