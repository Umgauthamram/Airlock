import nodemailer from 'nodemailer';

interface SendVerificationOptions {
  to: string;
  code: string;
}

export function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    // Return null if SMTP is not fully configured
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendVerificationEmail({ to, code }: SendVerificationOptions): Promise<{ success: boolean; devMode?: boolean; error?: string }> {
  const fromName = process.env.SMTP_FROM_NAME || 'Airlock Security Access';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@airlock.security';
  const fromAddress = `"${fromName}" <${fromEmail}>`;

  const transporter = getMailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #0f172a; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #0f172a; padding: 28px; text-align: center; }
          .logo { font-size: 22px; font-weight: 900; letter-spacing: 0.2em; color: #ffffff; text-transform: uppercase; font-family: monospace; }
          .dot { color: #10b981; }
          .content { padding: 36px 32px; text-align: center; }
          .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
          .desc { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 28px; }
          .code-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin: 0 auto 28px; display: inline-block; }
          .code { font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; }
          .validity { font-size: 12px; color: #94a3b8; }
          .footer { border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AIRLOCK<span class="dot">·</span></div>
          </div>
          <div class="content">
            <h1 class="title">Verify Your Demo Request</h1>
            <p class="desc">Enter the verification code below to activate your 12-hour isolated operator demo sandbox.</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <div class="validity">This single-use code is valid for 15 minutes.</div>
          </div>
          <div class="footer">
            This is an automated no-reply transmission from Airlock Security Gateway.<br>
            If you did not request demo access, you can safely ignore this message.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    // In local dev without live SMTP keys, log code clearly to console for instant developer feedback
    console.log(`\n==================================================`);
    console.log(`[AIRLOCK DEV MAIL] Verification email to: ${to}`);
    console.log(`[AIRLOCK DEV MAIL] From: ${fromAddress}`);
    console.log(`[AIRLOCK DEV MAIL] Verification Code: >>> ${code} <<<`);
    console.log(`==================================================\n`);
    return { success: true, devMode: true };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Your Airlock Demo Verification Code: ${code}`,
      text: `Your Airlock Demo Access verification code is: ${code}\nThis code is valid for 15 minutes.\n\nFrom: ${fromName}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (err: any) {
    console.error('[AIRLOCK SMTP ERROR]:', err);
    return { success: false, error: err.message };
  }
}

