import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/verification';
import { createDemoSession } from '@/lib/auth';
import { ensureDemoOrgSeeded } from '@/lib/data';

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
    const orgId = `demo-${cleanPrefix}`;

    // Seed distinct data for this individual demo account
    await ensureDemoOrgSeeded(orgId, normalizedEmail);

    // Create 12-hour operator session
    await createDemoSession({
      email: normalizedEmail,
      name: cleanPrefix.replace(/-/g, ' '),
      orgId,
    });

    return NextResponse.json({
      success: true,
      redirect: '/app',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
