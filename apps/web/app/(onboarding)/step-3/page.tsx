'use client';

import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { buildActivePillars } from '@lifegame/core';
import type { PillarId } from '@lifegame/types';
import styles from './step-3.module.css';

export default function Step3Page() {
  const router = useRouter();
  const { state, setBaseline } = useOnboarding();

  const activePillars = buildActivePillars(state.selectedPillarIds, state.customPillars);

  function handleSlider(pillarId: PillarId, value: number) {
    setBaseline({ ...state.baseline, [pillarId]: value });
  }

  function getValue(id: PillarId) {
    return state.baseline[id] ?? 5;
  }

  const LABELS: Record<number, string> = {
    1: 'Muito mal', 2: 'Mal', 3: 'Ruim', 4: 'Abaixo do médio',
    5: 'Médio', 6: 'Ok', 7: 'Bem', 8: 'Muito bem', 9: 'Ótimo', 10: 'Excelente',
  };

  return (
    <OnboardingShell
      step={3}
      totalSteps={5}
      title="Como você está em cada pilar?"
      subtitle="Ninguém mais vê isso — seja honesto com você mesmo. Esses valores são só para diagnóstico."
    >
      <div className={styles.sliders}>
        {activePillars.map((pillar) => {
          const val = getValue(pillar.id);
          return (
            <div key={pillar.id} className={styles.sliderRow}>
              <div className={styles.sliderHeader}>
                <span className={styles.pillarName}>{pillar.name}</span>
                <span className={styles.value}>
                  <strong>{val}</strong>
                  <span className={styles.label}>{LABELS[val]}</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={val}
                className={styles.range}
                style={{ '--fill': `${(val - 1) / 9 * 100}%` } as React.CSSProperties}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSlider(pillar.id, Number(e.target.value))}
              />
              <div className={styles.ticks}>
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          );
        })}
      </div>

      <OnboardingButton onClick={() => router.push('/step-4')}>
        Continuar →
      </OnboardingButton>
    </OnboardingShell>
  );
}
