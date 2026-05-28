import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingProvider } from '@/contexts/onboarding-context';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
