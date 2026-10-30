import { NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
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

    return NextResponse.json({
      success: true,
      verificationRequired: true,
      email: normalizedEmail,
      devCode: emailResult.devMode ? code : undefined,
      message: 'Verification code sent to your email address.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send verification code' }, { status: 500 });
  }
}
