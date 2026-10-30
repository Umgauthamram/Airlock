import { NextResponse } from 'next/server';
import { getSession, createSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add 2 hours (7,200,000 ms) to current session expiry
    const currentExp = session.exp || Date.now() + 12 * 60 * 60 * 1000;
    const newExp = Math.max(currentExp, Date.now()) + 2 * 60 * 60 * 1000;

    await createSessionCookie({
      ...session,
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

