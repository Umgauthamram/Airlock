import { NextResponse } from 'next/server';
import { createVerificationCode, RateLimitError } from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const code = await createVerificationCode(normalizedEmail);
    const emailResult = await sendVerificationEmail({ to: normalizedEmail, code });

    const isNonProd = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      verificationRequired: true,
      email: normalizedEmail,
      // Strictly never expose devCode in production
      devCode: isNonProd && emailResult.devMode ? code : undefined,
      message: 'Verification code sent to your email address.',
    });
  } catch (err: any) {
    if (err instanceof RateLimitError || err.name === 'RateLimitError') {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    return NextResponse.json({ error: err.message || 'Failed to send verification code' }, { status: 500 });
  }
}
