'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { validateStep2 } from '@lifegame/core';
import { DEFAULT_PILLARS, MIN_ACTIVE_PILLARS } from '@lifegame/types';
import type { PillarId, PillarConfig } from '@lifegame/types';
import styles from './step-2.module.css';

export default function Step2Page() {
  const router = useRouter();
  const { state, setPillars } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const [newPillarName, setNewPillarName] = useState('');

  const totalActive = state.selectedPillarIds.length + state.customPillars.length;

  function toggleDefault(id: PillarId) {
    const isSelected = state.selectedPillarIds.includes(id);
    const newIds = isSelected
      ? state.selectedPillarIds.filter((p) => p !== id)
      : [...state.selectedPillarIds, id];
    setError(null);
    setPillars(newIds, state.customPillars);
  }

  function addCustomPillar() {
    const name = newPillarName.trim();
    if (!name || name.length < 2) return;
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const pillar: Pick<PillarConfig, 'id' | 'name' | 'xpRate'> = {
      id,
      name,
      xpRate: 1.0,
    };
    setPillars(state.selectedPillarIds, [...state.customPillars, pillar]);
    setNewPillarName('');
  }

  function removeCustom(id: PillarId) {
    setPillars(
      state.selectedPillarIds,
      state.customPillars.filter((p) => p.id !== id)
    );
  }

  function handleContinue() {
    const err = validateStep2(state.selectedPillarIds, state.customPillars as PillarConfig[]);
    if (err) { setError(err); return; }
    router.push('/step-3');
  }

  return (
    <OnboardingShell
      step={2}
      totalSteps={5}
      title="Quais pilares você quer acompanhar?"
      subtitle={`Selecione pelo menos ${MIN_ACTIVE_PILLARS}. Você pode ajustar isso depois.`}
    >
      <div className={styles.grid}>
        {DEFAULT_PILLARS.map((pillar) => {
          const selected = state.selectedPillarIds.includes(pillar.id);
          return (
            <button
              key={pillar.id}
              className={`${styles.pillarCard} ${selected ? styles.selected : ''}`}
              onClick={() => toggleDefault(pillar.id)}
              type="button"
            >
              <span className={styles.pillarName}>{pillar.name}</span>
              <span className={styles.pillarFocus}>{pillar.xpRate}× XP/min</span>
            </button>
          );
        })}
      </div>

      {/* Custom pillars */}
      {state.customPillars.length > 0 && (
        <div className={styles.customList}>
          {state.customPillars.map((p) => (
            <div key={p.id} className={styles.customTag}>
              <span>{p.name}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeCustom(p.id)}
                aria-label={`Remover ${p.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add custom */}
      <div className={styles.addCustom}>
        <input
          className={styles.customInput}
          type="text"
          placeholder="+ Adicionar pilar personalizado"
          value={newPillarName}
          maxLength={30}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPillarName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomPillar()}
        />
        {newPillarName.trim().length >= 2 && (
          <button type="button" className={styles.addBtn} onClick={addCustomPillar}>
            Adicionar
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.footer}>
        <p className={styles.count}>
          {totalActive} pilar{totalActive !== 1 ? 'es' : ''} selecionado{totalActive !== 1 ? 's' : ''}
        </p>
        <OnboardingButton onClick={handleContinue} disabled={totalActive < MIN_ACTIVE_PILLARS}>
          Continuar →
        </OnboardingButton>
      </div>
    </OnboardingShell>
  );
}
