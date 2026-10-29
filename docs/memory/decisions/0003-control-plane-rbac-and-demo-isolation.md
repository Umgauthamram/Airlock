# 3. Control Plane Authentication, RBAC, and Isolated Demo Mode

Date: 2026-10-29
Status: Accepted

## Context
Airlock's control plane allows human operators and security administrators to inspect held scripts, review audit streams, edit policies, and trigger kill switches. The system must support role-based access control (Admin, Operator, Viewer), prevent unauthorized elevation (e.g. Viewer attempting to approve scripts), and provide instant access for hackathon judges/evaluators without mandating Google OAuth account whitelisting.

## Decision
1. **Server-Side Authorization & Role Freshness (`lib/auth.ts`)**:
   - Authentication tokens carry signed session claims (`userId`, `orgId`, `role`).
   - Every mutating endpoint (e.g. `/api/approvals/:id/decision`) and server-rendered view enforces `requireSession()` and `requireRole(minimumRole)` on the server. Client-side UI hiding is never the security boundary.
   - Roles are strictly ordered: `Viewer` (1) < `Operator` (2) < `Admin` (3).
   - Only `Operator` and `Admin` principals can approve/deny scripts or trigger kill switches.
2. **Demo Mode Isolation (`orgId: demo`)**:
   - Under `DEMO_MODE=1`, clicking "Explore the Demo" generates an Operator session bound strictly to `orgId = demo`.
   - All Redis keys include the `{orgId}` cluster hash tag (`org:{demo}:...`), isolating demo state entirely from production data.
   - Demo mode auto-seeds an interactive prompt-injection defense scenario with live audit telemetry.
3. **Restrained Editorial Visual Design**:
   - Implemented with Next.js 16 App Router and Tailwind CSS, adhering to the design brief: warm paper background (`#fbfaf8`), `Source Serif 4` for headlines, `IBM Plex Sans` for body, `IBM Plex Mono` for code, and zero generic neon/glassmorphism fluff.

## Consequences
- Hackathon judges can instantly test the end-to-end approval and audit workflow with one click.
- Enforced server-side RBAC guarantees viewers cannot approve scripts or manipulate agent kill switches.
- Strict Redis key isolation guarantees demo exploration cannot corrupt production data.

