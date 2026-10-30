import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { seedDemoSimulation, clearDemoData } from '@/lib/data';
import { getRedisClient, RedisKeys } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'simulate_attack';

    if (action === 'simulate_attack') {
      await seedDemoSimulation(session.orgId, session.email);
      return NextResponse.json({
        success: true,
        message: 'Simulated prompt injection exfiltration attack held in approval queue.',
      });
    }

    if (action === 'simulate_benign') {
      const redis = getRedisClient();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const budgetKey = `org:{${session.orgId}}:budget:agent-nemotron-super:${today}`;
      await redis.hincrby(budgetKey, 'calls', 1);

      const streamKey = RedisKeys.streamAudit(session.orgId);
      await redis.xadd(
        streamKey,
        '*',
        'id', `evt-${Date.now()}`,
        'timestamp', new Date().toISOString(),
        'orgId', session.orgId,
        'eventType', 'script.allowed',
        'agentId', 'agent-nemotron-super',
        'details', JSON.stringify({ tools: ['inbox.get_emails'], decision: 'allow', runtimeMs: 0.7 })
      );

      return NextResponse.json({
        success: true,
        message: 'Simulated routine benign agent task completed cleanly.',
      });
    }

    if (action === 'clear') {
      await clearDemoData(session.orgId);
      return NextResponse.json({
        success: true,
        message: 'Account data and history reset to clean initial state.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Simulation failed' }, { status: 500 });
  }
}

