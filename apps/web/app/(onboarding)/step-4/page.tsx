'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { buildActivePillars, validateStep4 } from '@lifegame/core';
import { MAX_PRIORITY_PILLARS } from '@lifegame/types';
import type { PillarId } from '@lifegame/types';
import styles from './step-4.module.css';

export default function Step4Page() {
  const router = useRouter();
  const { state, setPriorities } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const activePillars = buildActivePillars(state.selectedPillarIds, state.customPillars);
  const priorities = state.priorityPillarIds;

  function toggle(id: PillarId) {
    setError(null);
    if (priorities.includes(id)) {
      setPriorities(priorities.filter((p) => p !== id));
    } else if (priorities.length < MAX_PRIORITY_PILLARS) {
      setPriorities([...priorities, id]);
    }
  }

  function handleContinue() {
    const err = validateStep4(priorities, [
      ...state.selectedPillarIds,
      ...state.customPillars.map((p) => p.id),
    ]);
    if (err) { setError(err); return; }
    router.push('/step-5');
  }

  return (
    <OnboardingShell
      step={4}
      totalSteps={5}
      title="Onde quer focar nos próximos 3 meses?"
      subtitle={`Escolha até ${MAX_PRIORITY_PILLARS} pilares. Isso afeta as sugestões do app — não o XP.`}
    >
      <div className={styles.list}>
        {activePillars.map((pillar) => {
          const rank = priorities.indexOf(pillar.id);
          const isPriority = rank !== -1;
          const atLimit = priorities.length >= MAX_PRIORITY_PILLARS;

          return (
            <button
              key={pillar.id}
              type="button"
              className={`${styles.item} ${isPriority ? styles.selected : ''} ${
                !isPriority && atLimit ? styles.dimmed : ''
              }`}
              onClick={() => toggle(pillar.id)}
            >
              <span className={styles.rankBadge}>
                {isPriority ? <strong>#{rank + 1}</strong> : <span className={styles.empty} />}
              </span>
              <span className={styles.pillarName}>{pillar.name}</span>
              {isPriority && <span className={styles.check}>✓</span>}
            </button>
          );
        })}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        {priorities.length === 0
          ? 'Nenhum pilar selecionado'
          : `${priorities.length} de ${MAX_PRIORITY_PILLARS} selecionados`}
      </p>

      <OnboardingButton onClick={handleContinue} disabled={priorities.length === 0}>
        Continuar →
      </OnboardingButton>
    </OnboardingShell>
  );
}
