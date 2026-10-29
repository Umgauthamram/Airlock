# Airlock: Product Requirements Document

Draft v0.1 · October 29, 2026 · Nebius x NVIDIA Global AI Hackathon, Coding & Agentic Engineering track

## 1. Summary

Airlock is a production gateway that sits between AI agents and the tools they use (MCP servers). Instead of letting an agent call tools one at a time, Airlock lets the agent write a short script. Airlock inspects the script before anything runs, applies deterministic policy, holds risky scripts for human approval, runs approved ones in a sandbox, and records every step in an audit log. Because one script replaces many tool-call round trips, token use drops as well.

Pitch: review the plan before the agent acts.

“Airlock” is a working name.

## 2. Problem

Teams are moving agents from demos to production and running into three problems.

1. **Agents get hijacked by what they read.** Forever Security reported a live attack in October 2026 in which a malicious AGENTS.md file hijacked coding agents (a single report, so treat it as a strong signal rather than a settled fact). A dated incident list at github.com/webpro255/awesome-ai-agent-attacks includes coding-agent command-approval bypasses from mid-October 2026. Microsoft warned on October 20, 2026 that static permissions cannot tell whether an agent’s current authority is still appropriate once its behavior has shifted.
2. **LLM-based guards are easy to talk out of working.** A Datadog Security Labs result, listed in the same incident log, showed fake policy text cutting one guard model’s detection recall from about 83% to under 4% on one dataset. Airlock’s control decisions are therefore deterministic. LLMs only suggest and explain.
3. **Agent bills are hard to predict.** Gartner expects inference cost per agentic workflow to rise more than fivefold through 2028 even as token prices fall, and agentic tasks use roughly 5 to 30 times the tokens of a chatbot answer. Loading every tool definition into context and routing every intermediate result back through the model is a large part of that. Anthropic describes code execution with MCP as a remedy, and gateways such as Bifrost already ship it.

**Insight.** When an agent calls tools step by step, every call looks harmless on its own and the plan is invisible. A script is the whole plan in one artifact, so it can be analyzed before anything runs.

## 3. Positioning and honesty notes

- Code mode plus audit logs plus access control already exists in commercial gateways. Airlock’s differentiation is not code mode itself. It is (a) pre-execution analysis of the plan against a data-flow policy, (b) a human approval workflow with role-based access, and (c) published, reproducible measurements.
- Related research: CaMeL (Google DeepMind) controls data flow for agents by having a model write code that runs in a restricted interpreter. This is recalled from memory. Verify before citing it in the submission.
- Airlock has not been compared feature by feature with existing gateways. Do that before claiming novelty in the submission text.

## 4. Goals and non-goals

**Goals** (items marked \[H\] belong to the hackathon slice)

- G1 \[H\] Inspect and gate agent-written scripts before they execute.
- G2 \[H\] Reduce token use against classic tool calling when many tools are connected, and measure it.
- G3 \[H\] Give humans a clear approval workflow with role-based access.
- G4 \[H\] Keep a complete audit trail of requests, decisions, approvals, tool calls, and admin actions.
- G5 Production basics: authentication, authorization, key management, budgets, fail-closed behavior, observability.

**Non-goals for v1**

- Full variable-level taint tracking (planned as a later phase).
- Multi-tenant workspaces (the data model is ready for them, the product is single-organization).
- SSO beyond Google, SAML, SCIM.
- Classifying natural-language text as “injection or not” as a primary control.
- Non-MCP tool integrations.
- Repository detonation with canary credentials (stretch goal, see FR-20).

## 5. Users and roles

**Human roles (single organization):**

- **Admin.** Security or platform owner. Sets policy, registers tool servers, approves tool tags, manages users and agent keys.
- **Operator.** On-call engineer or agent owner. Reviews and decides held scripts, suspends agents, runs the playground.
- **Viewer.** Manager, auditor, or teammate. Read-only access to dashboard, audit log, tools, and policies.

**Machine principal:**

- **Agent.** Authenticates with an API key. Can only reach the gateway endpoint, never the admin UI.

**Permissions**

- View dashboard, audit log, tools, policies, benchmark results: Viewer, Operator, Admin.
- Approve or deny held scripts: Operator, Admin.
- Suspend or resume an agent (kill switch): Operator, Admin.
- Use the playground: Operator, Admin.
- Register tool servers and confirm tool tags: Admin.
- Edit policy: Admin.
- Create, scope, and revoke agent API keys: Admin.
- Invite users, change roles, deactivate users: Admin.

All checks are enforced on the server for every request. Hiding a button in the UI is never the control.

## 6. Key user stories and acceptance criteria

**US-1 Agent developer connects an agent.** Given an Admin created an agent key, when the developer points an MCP client at the gateway URL with that key, then the client sees `search_tools`, `run_script`, and `get_result`, and nothing else.

**US-2 Risky script is held.** Given a script reads from a tool tagged `reads_untrusted` and also calls a tool tagged `writes_external`, when the agent submits it, then nothing executes, the response is `held` with an approval id, and an entry appears in the approvals queue within 2 seconds with the script, the flagged tool pair, and a plain-language explanation.

**US-3 Operator decides.** Given a held script, when an Operator approves it, then the script runs once in the sandbox and the result is retrievable by the agent with `get_result`. When denied, or when 24 hours pass, the agent receives a denial with the reason.

**US-4 Safe script runs immediately.** Given a script that only calls read tools of trusted sources, when submitted, then it runs without human involvement and the audit log shows the policy version and rule evaluation.

**US-5 Dynamic tricks are rejected.** Given a script that uses `eval`, aliases the `tools` object, or computes a tool name at runtime, when submitted, then it is denied at analysis time with the offending line.

**US-6 Admin invites a teammate.** Given an Admin invites an email address with a role, when that person signs in with Google using that email, then they land in the app with that role. A Google account that was not invited sees a request-access page and no data.

**US-7 Kill switch.** Given an agent behaving oddly, when an Operator suspends it, then every subsequent request from that key is refused within 1 second, and the action is audited.

**US-8 Budget exhaustion fails closed.** Given an agent hit its daily token or call budget, when it submits another script, then it receives a clear budget error and nothing runs.

**US-9 Auditor reviews.** Given a Viewer, when they open the audit log, then they can filter by agent, decision, and time range and export JSON, and cannot see any approve, deny, or edit controls.

**US-10 Judge or visitor tries the product.** Given the public demo deployment, when a visitor clicks “Explore the demo,” then they enter an isolated demo organization with seeded data and can run the attack scenario end to end without creating an account.

## 7. Functional requirements

Priority: P0 must ship, P1 should ship, P2 later. \[H\] marks the hackathon slice.

- **FR-1 \[H\] P0 Agent-facing MCP endpoint.** Streamable HTTP MCP server exposing `search_tools`, `run_script`, `get_result`.
- **FR-2 \[H\] P0 Tool registry.** Register upstream MCP servers, discover their tools, store trust tags per tool (`reads_untrusted`, `reads_private`, `writes_external`, `writes_internal`, `destructive`). Nano proposes tags, an Admin confirms them. Unconfirmed tools are not callable.
- **FR-3 \[H\] P0 Script analysis.** Parse the script, enforce an allowed syntax subset, extract every tool call statically, reject dynamic dispatch.
- **FR-4 \[H\] P0 Policy engine.** Versioned rules over tags produce `allow`, `hold`, or `deny`. Precedence is deny, then hold, then allow. Fail closed on any error.
- **FR-5 \[H\] P0 Approvals.** Queue, detail view, approve and deny, 24-hour expiry treated as denial, result retrieval.
- **FR-6 \[H\] P0 Sandboxed execution.** Isolated runtime with time, memory, call-count, and output limits. Every tool call is proxied through the gateway and re-checked against the approved call set.
- **FR-7 \[H\] P0 Audit log.** Append-only record of every request, decision, approval, tool call, and admin action. Filter, search, JSON export.
- **FR-8 \[H\] P0 Authentication.** Google OAuth, invite-only, bootstrap admin by environment variable, session expiry, sign out.
- **FR-9 \[H\] P0 RBAC.** Admin, Operator, Viewer enforced on every route handler and server action.
- **FR-10 \[H\] P0 Agent keys.** Create, show once, scope to tool groups, revoke, last-used time.
- **FR-11 \[H\] P1 Budgets and rate limits.** Per-agent daily token budget and per-minute call limit, atomic in Redis.
- **FR-12 \[H\] P1 Caching and tool search.** Semantic tool search using Redis vector search so agents load only relevant tool stubs. Exact-match script cache so repeat tasks cost no model tokens.
- **FR-13 \[H\] P1 Dashboard.** Live activity, pending approvals, allow/hold/deny counts, tokens saved, added latency.
- **FR-14 \[H\] P1 Playground.** Run one task through a reference Nemotron agent in classic mode and in Airlock mode, side by side, with token counts from API usage fields.
- **FR-15 \[H\] P1 Public pages.** Landing, login, request access, terms, privacy, quickstart.
- **FR-16 \[H\] P1 Demo mode.** Guest entry into an isolated demo organization (a separate org\_id) with seeded data, no real upstream credentials, and automatic reset.
- **FR-17 P2 Policy editor with simulation.** Test a script against a draft policy before activating it.
- **FR-18 P2 Domain reputation.** Use Tavily to check hosts found in script arguments (targets the Best Use of Tavily prize).
- **FR-19 P2 Taint tracking.** Track data flow between variables inside a script to cut false positives.
- **FR-20 P2 Detonation mode.** Run an untrusted repository’s instructions through a sandboxed agent with canary credentials.

## 8. Pages and information architecture

**Public**

- `/` landing page
- `/login` Google sign-in, plus “Explore the demo” on the demo deployment
- `/request-access` shown after a sign-in from an account that was not invited
- `/docs` quickstart for connecting an agent
- `/terms` and `/privacy` (drafts based on real data practices, clearly marked for review)

**Application** (signed in)

- `/app` overview dashboard
- `/app/approvals` and `/app/approvals/[id]`
- `/app/audit`
- `/app/tools` and tool detail with tag editor (Admin edits)
- `/app/policies` (Admin edits, others read)
- `/app/agents` and agent detail with keys, budgets, kill switch
- `/app/playground`
- `/app/results` benchmark results
- `/app/admin/users` (Admin only)
- `/app/settings` profile and sign out

Sidebar items are filtered by role, but each page and API enforces the role again.

## 9. Landing page brief

The brief follows the “AI Action Letter #81” guidance you shared, adapted to this product.

**Content plan**

1. **Headline and hero.** A specific headline, for example “Hold risky agent scripts before they run.” One line of support text. The hero visual is a real screenshot of the approvals screen showing a held script and its flagged flow, captured from the running app with seeded data and labelled as demo data.
2. **The problem in one example.** A walkthrough of the hidden-instruction email scenario, showing the script an agent wrote and why it was held.
3. **How it works.** A short flow (agent writes script, Airlock checks, human approves, sandbox runs, audit log) shown with a real example, not an icon grid.
4. **Measured results.** Our own benchmark numbers with the method linked. This section ships only after real measurements exist. No placeholder statistics.
5. **Quickstart.** A real snippet that connects an MCP client to the gateway.
6. **Open source.** License, repository link, and what is and is not covered.
7. **Footer.** Terms and Privacy.

**Design rules**

- Warm neutral background (not pure white), dark readable text, one restrained accent, hierarchy through type, spacing, and alignment.
- No purple-and-black theme, rainbow or neon colors, radial orbs, dot grids, glass effects, sparkle icons, emojis, or shadows on everything.
- No Inter, Geist, or Space Grotesk, and no Lucide icons. Proposed type: a serif for headlines (for example Source Serif 4), IBM Plex Sans for body, IBM Plex Mono for code, all loaded through next/font. Icons only where they clarify an action.
- No three-feature-card row, bento grid, decorative terminal window, or three pricing tiers. Vary section layouts by what each section explains.
- No invented testimonials, logos, customer counts, or statistics. Simulated content is labelled.
- Copy avoids em dashes and en dashes, and states benefits directly.
- Motion is restrained, respects reduced-motion settings, and never blocks normal scrolling.
- Every button, menu, and form works. Visible k
eyboard focus, labelled inputs, useful error and empty states, skeleton loaders only for real async content.
- Verify at desktop and mobile widths: wrapping, overflow, contrast, links, and the main action completing.

## 10. Non-functional requirements

Targets below are goals to be measured, not results.

- **Added latency.** Analysis of a typical script under 50 ms at p95. A cached or allowed script adds under 150 ms at p95, excluding tool and model time.
- **Fail closed.** If the gateway, Redis, or policy evaluation errors, the agent receives a refusal. There is no bypass path.
- **Security.** Server-side authorization everywhere, hashed agent keys, encrypted upstream credentials, TLS everywhere, least-privilege Redis users, no secrets in logs.
- **Privacy and retention.** The audit log stores metadata and truncated, pattern-redacted arguments by default, not full tool outputs. Retention is configurable and defaults to 30 days for the stream.
- **Accessibility.** Meet WCAG 2.1 AA basics for contrast, focus, and labels.
- **Responsive.** Landing page and approvals screens work well on a phone, because approving from a phone is a realistic use.
- **Operability.** Structured logs, health endpoint, metrics endpoint, one-command local setup with Docker Compose.

## 11. Success metrics and benchmark plan

Publish a reproducible benchmark (`pnpm bench`) with its method and raw data.

- **Corpus.** At least 30 attack scenarios (hidden instructions in email, tickets, web pages, file contents, tool descriptions; attempts to alias or hide tool calls) and at least 30 benign tasks. A tool catalog scaled to roughly 50 mock tools across several servers.
- **Measurements.** Attack block or hold rate. False-hold rate on benign tasks. Token use, classic versus Airlock mode, from API usage fields. Script cache hit rate. Added latency p50 and p95. Cost per task by model tier.
- **Reporting rules.** Report failures and false holds, not only wins. State that the corpus is our own and small. Do not compare against other products without running them.

## 12. Hackathon submission mapping

Submission closes October 30, 2026 at 10:00 AM PDT (about 10:30 PM IST). Confirm on Devpost.

- Working project running on Nebius Token Factory using NVIDIA Nemotron models.
- Category: Coding and Agentic Engineering.
- Project description covering what, why, and how.
- Working demo URL (Vercel UI plus gateway on a Nebius VM).
- Demo video of 3 minutes or less on public YouTube, showing Token Factory and Nemotron in use.
- Public repository (GitHub) with an open-source license visible at the top (proposed: Apache-2.0), and a README with setup steps and a section on Nemotron, Token Factory, and any other Nebius services used.
- Written feedback on Token Factory, AI Cloud, and NVIDIA tools (keep a running FEEDBACK.md during the build).
- If any code existed before the submission period, a written note of what changed during it.

## 13. Risks, assumptions, open questions

**Risks**

- Nemotron may write invalid or unsafe scripts. Mitigation: examples in the prompt, an analyzer that rejects bad scripts with line-level errors, and one repair attempt by Ultra.
- A conservative policy will hold some harmless scripts. Mitigation: approvals are quick, and variable-level taint tracking is planned.
- The sandbox is a security boundary and must be tested hard. Mitigation: adversarial script test suite and defense in depth (see the TRD).
- Scope is large for the deadline. Mitigation: the plan has a cut line, and the core pipeline ships first.

**Assumptions**

- One organization, with `org_id` in every Redis key so multi-tenancy can be added later.
- Judges can use the public demo without creating an account.
- Token Factory credits cover the benchmark runs.

**Open questions**

- Which embedding model does Token Factory serve for the tool search? To be confirmed in Phase 0. Fallback is Redis full-text search.
- Does the Redis Cloud plan in use include the Search and JSON modules with enough memory for vectors?
- Final product name and domain.
