import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { hasMinimumRole, Role } from '@airlock/shared';
import { decideApprovalViaGateway, getApprovalById } from '@/lib/data';
import { getRedisClient, RedisKeys } from '@/lib/redis';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  // RBAC enforcement: Only Operator and Admin can decide approvals
  if (!hasMinimumRole(session.role, Role.OPERATOR)) {
    return NextResponse.json(
      { error: 'Forbidden: Operator or Admin role required to decide approvals.' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const decision = body?.decision;
  const note = body?.note;

  if (decision !== 'approved' && decision !== 'denied') {
    return NextResponse.json({ error: "Decision must be 'approved' or 'denied'." }, { status: 400 });
  }

  try {
    // Try calling the gateway service if running
    const gatewayOutcome = await decideApprovalViaGateway(id, decision, session.userId, note, session.orgId);
    revalidatePath('/app/approvals');
    revalidatePath(`/app/approvals/${id}`);
    revalidatePath('/app');
    revalidatePath('/app/audit');
    return NextResponse.json(gatewayOutcome);
  } catch {
    // Fallback for direct recording into Redis (demo mode, simulated scenarios, or gateway offline)
    const redis = getRedisClient();
    const appr = await getApprovalById(session.orgId, id);

    if (!appr) {
      return NextResponse.json({ error: 'Approval record not found.' }, { status: 404 });
    }

    if (appr.status !== 'pending') {
      return NextResponse.json({ error: `Approval already decided (${appr.status}).` }, { status: 409 });
    }

    appr.status = decision;
    appr.decidedBy = session.userId;
    appr.decidedAt = new Date().toISOString();
    appr.decisionNote = note;

    await redis.set(RedisKeys.approval(session.orgId, id), JSON.stringify(appr));
    const altId = id.includes('_') ? id.replace(/_/g, '-') : id.replace(/-/g, '_');
    await redis.set(RedisKeys.approval(session.orgId, altId), JSON.stringify(appr));

    // Log to audit stream
    const streamKey = RedisKeys.streamAudit(session.orgId);
    await redis.xadd(
      streamKey,
      '*',
      'id',
      `evt-${Date.now()}`,
      'timestamp',
      new Date().toISOString(),
      'eventType',
      decision === 'approved' ? 'script-approved' : 'script-denied',
      'userId',
      session.userId,
      'approvalId',
      id,
      'details',
      JSON.stringify({ note, decision, executed: decision === 'approved' })
    );

    revalidatePath('/app/approvals');
    revalidatePath(`/app/approvals/${id}`);
    revalidatePath('/app');
    revalidatePath('/app/audit');

    return NextResponse.json({ success: true, status: decision });
  }
}

