import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LandingPageClient from './LandingPageClient';

export default async function Page() {
  const session = await getSession();

  // If user has an active authenticated/demo session, redirect directly to dashboard
  if (session) {
    redirect('/app');
  }

  return <LandingPageClient />;
}
