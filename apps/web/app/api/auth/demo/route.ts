import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  // Direct creation of unverified demo sessions is disabled to prevent authentication bypass.
  // Redirect users to the secure demo request flow.
  return NextResponse.redirect(new URL('/demo-request', url.origin));
}
