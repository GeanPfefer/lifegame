import { OnboardingProvider } from '@/contexts/onboarding-context';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
