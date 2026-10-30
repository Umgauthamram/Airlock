import { NextResponse } from 'next/server';
import { getSession, createSessionCookie } from '@/lib/auth';

const MAX_DEMO_LIFETIME_MS = 16 * 60 * 60 * 1000; // 16 hours max total lifetime
const EXTENSION_INCREMENT_MS = 2 * 60 * 60 * 1000; // 2 hours per extension

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only demo sessions are permitted to request extensions
    if (!session.isDemo) {
      return NextResponse.json(
        { error: 'Forbidden: Session extension is only available for demo accounts.' },
        { status: 403 }
      );
    }

    const now = Date.now();
    const currentExp = session.exp || now + 12 * 60 * 60 * 1000;
    
    const initialCreatedAt = session.demoCreatedAt || (currentExp - 12 * 60 * 60 * 1000);
    const maxAllowedExpiry = initialCreatedAt + MAX_DEMO_LIFETIME_MS;

    const newExp = Math.max(currentExp, now) + EXTENSION_INCREMENT_MS;

    if (newExp > maxAllowedExpiry) {
      return NextResponse.json(
        { error: 'Maximum demo extension limit reached (16 hours maximum total).' },
        { status: 400 }
      );
    }

    await createSessionCookie({
      ...session,
      demoCreatedAt: initialCreatedAt,
      exp: newExp,
    });

    return NextResponse.json({
      success: true,
      newExp,
      message: 'Extension approved: +2 hours added',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to extend session' }, { status: 500 });
  }
}
