import { NextResponse } from 'next/server';
import { createDemoRequest, getDemoRequest, approveDemoRequest } from '@/lib/demo-requests';
import { createDemoSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, orgName, useCase, action } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (action === 'fast-track') {
      const approved = await approveDemoRequest(email);
      if (!approved) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      // Stamp 12-hour session cookie
      await createDemoSession({
        email: approved.email,
        name: approved.name,
        orgId: approved.orgName || 'demo',
      });

      return NextResponse.json({
        success: true,
        request: approved,
        status: 'approved',
        redirect: '/app',
      });
    }

    // Create or retrieve existing demo request
    let request = await getDemoRequest(email);
    if (!request || request.status === 'expired') {
      request = await createDemoRequest({ email, name, orgName, useCase });
    }

    // If already approved (e.g. 5 minutes already elapsed)
    if (request.status === 'approved') {
      await createDemoSession({
        email: request.email,
        name: request.name,
        orgId: request.orgName || 'demo',
      });
      return NextResponse.json({
        success: true,
        request,
        status: 'approved',
        redirect: '/app',
      });
    }

    return NextResponse.json({
      success: true,
      request,
      status: request.status,
      remainingMs: Math.max(0, request.autoApprovesAt - Date.now()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process demo request' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const request = await getDemoRequest(email);
  if (!request) {
    return NextResponse.json({ status: 'not_found' }, { status: 404 });
  }

  // If status is approved (auto-approved after 5 mins)
  if (request.status === 'approved') {
    await createDemoSession({
      email: request.email,
      name: request.name,
      orgId: request.orgName || 'demo',
    });
    return NextResponse.json({
      status: 'approved',
      request,
      redirect: '/app',
    });
  }

  return NextResponse.json({
    status: request.status,
    request,
    remainingMs: Math.max(0, request.autoApprovesAt - Date.now()),
  });
}
