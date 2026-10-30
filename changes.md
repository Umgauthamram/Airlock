1. Why the deployment failed

The log line Ignoring not compatible lockfile is what pnpm 7 and 8 print for this repo’s lockfileVersion: 9.0. I reproduced it with pnpm 8.15.9 and 7.33.7. With pnpm 9.15.4 the same lockfile installs cleanly on Node 22 and Node 24, and the whole monorepo builds. So Vercel was not running the 9.15.4 your install command tries to set up. My best explanation, which the log can’t confirm because it never prints the version, is that an older pnpm already on PATH took precedence over the npm i -g copy. Once the lockfile is ignored, pnpm queries the registry for everything. Other Vercel users have hit the same ERR_INVALID_THIS failure when pnpm did a full resolution instead of using a lockfile. I couldn’t reproduce that second error locally. 
vercel

Two stray npm lockfiles are tracked (package-lock.json at the root and in apps/web), and there are two vercel.json files, which makes detection ambiguous.

Fix

git rm package-lock.json apps/web/package-lock.json, and delete the root vercel.json.
Replace apps/web/vercel.json with this (I tested both commands):
json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "cd ../.. && npx --yes pnpm@9.15.4 --version && npx --yes pnpm@9.15.4 install --frozen-lockfile",
  "buildCommand": "cd ../.. && npx --yes pnpm@9.15.4 --filter \"@airlock/web...\" build",
  "outputDirectory": ".next"
}

npx pnpm@9.15.4 can’t be shadowed by another pnpm on PATH, and the --version line prints which one ran. The filtered build skips the gateway and bench packages.
3. In Vercel settings, set Node.js to 22.x and confirm “Include source files outside the Root Directory” is on.
4. Set AUTH_SECRET, AUTH_URL, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, BOOTSTRAP_ADMIN_EMAILS, REDIS_URL, GATEWAY_PUBLIC_URL, AIRLOCK_MASTER_KEY and the SMTP_* values.

Vercel only deploys the web app. The gateway isn’t deployed anywhere yet (see section 4).

2. Tests

23 of 23 pass: shared 3, mocks 2, nebius 1, policy 5, analyzer 9, agent-ref 1, bench 1, gateway 1. The gaps:

The web app has no tests, there is no CI workflow, and no test covers the escapes or the denial-of-service case below.
The benchmark numbers disagree in four places. The README says 94.7% (25,214 vs 471,480 tokens). The committed JSON says 99.6% (2,700 vs 607,957). A fresh offline run says 99.5% (3,441 vs 628,400) on 31 scenarios. The results page hardcodes 94.7%.
The Nebius client still silently falls back to canned output with estimated token counts, and nothing flags it. A benchmark run can’t prove Nemotron was actually called.
3. Feature status
Feature	Status	Notes
Analyzer and policy engine	Working	Blocks literal-key escapes; runtime-built keys still pass
Hold / approve / deny	Working	No atomic claim found, and the web fallback path skips execution
Audit stream	Working	
Agent endpoint	Partial	JSON-RPC style with tools/list and tools/call; not verified against real MCP clients
Sandbox	Broken	Still in-process node:vm, and escapes (see 4)
Nemotron calls	Partial	Gateway now calls Nano, Super and Ultra; the fallback hides failures
Google login	Insecure	Works, but see 4
Roles (Admin, Operator, Viewer)	Partial	Enforced on approvals and agents; no users or invite page
Public and demo pages	Working	Insecure demo login
Tool registry and tag editor	Missing	Mock catalog only
Budgets and rate limits	Partial	Call counter only
Vector search and find_script	Missing	
Playground page	Missing	Only gateway endpoints exist
Deployment files	Not working	Empty Caddyfile, see 4
4. Security

Fixed since my first review: the literal-key escapes are blocked, /api/* now needs a bearer token, host builtins are no longer injected, and sessions carry an expiry inside the signed payload.

Critical

The sandbox escape still works (I ran it). Two scripts pass the analyzer, get allow from policy, run with no human involved, and reach the host process object. They are Object.getOwnPropertyNames(...).find(...) followed by p[k], and Reflect.get(..., ['con','structor'].join('')).
Any Google account gets Operator on the main org. The callback has no invite check, no email_verified check, and never reads ALLOWED_EMAIL_DOMAIN. It also overwrites the user record on every login, which re-activates deactivated users and resets roles.
Demo verification can be bypassed. GET /api/auth/demo?email= and POST /api/auth/google each create an Operator session with no check. The demo-request route returns the code in its response when SMTP is unset. The code comes from Math.random() with unlimited attempts and no rate limits, so it can also be used to spam arbitrary addresses through your SMTP account.
Default secrets are public. The session secret has a hardcoded fallback. The gateway and web app have two different fallback master keys, so approvals fail in the default configuration. docker-compose.yml hardcodes the key and the Redis password, and publishes Redis (6379) and RedisInsight (8001) on all interfaces.

High
5. One while(true){ await null } script freezes the gateway permanently (I ran it).
6. The Caddyfile is empty (0 bytes), so there is no TLS or proxy. The gateway Dockerfile uses unpinned pnpm@latest, --frozen-lockfile=false, and runs as root.

Medium

The web-to-gateway decision call isn’t tied to an org, and gateway errors come back as HTTP 200.
demo-extend lets any session, including a real Admin, extend its own expiry indefinitely.
Demo orgs are keyed by email prefix, so a.b@x.com and a-b@y.com share one.
The dashboard’s “tokens saved” is a formula (calls × 3850 + hash % 700), not a measurement.