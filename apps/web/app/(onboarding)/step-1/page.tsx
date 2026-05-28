'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { validateStep1 } from '@lifegame/core';
import styles from './step-1.module.css';

export default function Step1Page() {
  const router = useRouter();
  const { state, setName } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    const err = validateStep1(state.name);
    if (err) { setError(err); return; }
    router.push('/step-2');
  }

  return (
    <OnboardingShell
      step={1}
      totalSteps={3}
      title="Como você quer ser chamado?"
      subtitle="Esse é o nome do seu personagem. Pode ser seu nome real ou um apelido."
    >
      <div className={styles.field}>
        <input
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="text"
          placeholder="Seu nome"
          value={state.name}
          autoFocus
          maxLength={50}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <OnboardingButton onClick={handleContinue} disabled={!state.name.trim()}>
        Continuar →
      </OnboardingButton>
    </OnboardingShell>
  );
}
