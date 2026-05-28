import { redirect } from 'next/navigation';

// Redireciona para onboarding (auth será adicionada depois)
export default function RootPage() {
  redirect('/step-1');
}
