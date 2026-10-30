import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { verifyCode } from '@/lib/verification';
import { attachSessionCookie, createDemoSession } from '@/lib/auth';
import { Role } from '@airlock/shared';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isValid = await verifyCode(normalizedEmail, code);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code. Please check your email and try again.' }, { status: 400 });
    }

    const cleanPrefix = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const emailHash = createHash('sha256').update(normalizedEmail).digest('hex').slice(0, 10);
    // Unique deterministic orgId prevents collision across domains or sanitized prefixes
    const orgId = `demo-${cleanPrefix}-${emailHash}`;
    const demoSession = {
      userId: `usr_demo_${Date.now().toString(36)}`,
      email: normalizedEmail,
      name: cleanPrefix.replace(/-/g, ' '),
      orgId,
      role: Role.OPERATOR,
      isDemo: true,
      exp: Date.now() + 12 * 60 * 60 * 1000,
    };

    // Create 12-hour operator session in clean initial state
    await createDemoSession({
      email: normalizedEmail,
      name: cleanPrefix.replace(/-/g, ' '),
      orgId,
    });

    const response = NextResponse.json({
      success: true,
      redirect: '/app',
    });
    attachSessionCookie(response, demoSession);

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
