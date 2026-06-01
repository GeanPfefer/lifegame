'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { validateStep2 } from '@anima/core';
import { DEFAULT_PILLARS, MIN_ACTIVE_PILLARS } from '@anima/types';
import type { PillarId, PillarConfig } from '@anima/types';
import styles from './step-3.module.css';

export default function Step3Page() {
  const router = useRouter();
  const { state, setPillars, allPillarOptions } = useOnboarding();
  const [error, setError]                       = useState<string | null>(null);
  const [newPillarName, setNewPillarName]        = useState('');
  const [selectedParents, setSelectedParents]    = useState<string[]>([]);
  const [showParentPicker, setShowParentPicker]  = useState(false);

  const totalActive = state.selectedPillarIds.length + state.customPillars.length;

  function toggleDefault(id: PillarId) {
    const isSelected = state.selectedPillarIds.includes(id);
    const newIds = isSelected
      ? state.selectedPillarIds.filter((p) => p !== id)
      : [...state.selectedPillarIds, id];
    setError(null);
    setPillars(newIds, state.customPillars);
  }

  function toggleParent(id: string) {
    setSelectedParents((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function addCustomPillar() {
    const name = newPillarName.trim();
    if (!name || name.length < 2) return;
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const pillar = { id, name, xpRate: 1.0, parentIds: selectedParents.length > 0 ? selectedParents : undefined };
    setPillars(state.selectedPillarIds, [...state.customPillars, pillar]);
    setNewPillarName('');
    setSelectedParents([]);
    setShowParentPicker(false);
  }

  function removeCustom(id: PillarId) {
    setPillars(state.selectedPillarIds, state.customPillars.filter((p) => p.id !== id));
  }

  function handleContinue() {
    const err = validateStep2(state.selectedPillarIds, state.customPillars as PillarConfig[]);
    if (err) { setError(err); return; }
    router.push('/step-4');
  }

  const canAddPillar = newPillarName.trim().length >= 2;

  return (
    <OnboardingShell
      step={3}
      totalSteps={5}
      title="Quais pilares você quer acompanhar?"
      subtitle="Selecione os que fazem parte da sua vida. Não precisa focar em todos ao mesmo tempo — você decide onde investir energia."
      backHref="/step-2"
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
            </button>
          );
        })}
      </div>

      {state.customPillars.length > 0 && (
        <div className={styles.customList}>
          {state.customPillars.map((p) => (
            <div key={p.id} className={styles.customTag}>
              <div className={styles.customTagInfo}>
                <span className={styles.customTagName}>{p.name}</span>
                {p.parentIds && p.parentIds.length > 0 && (
                  <span className={styles.customTagParents}>
                    → {p.parentIds.map((pid) => allPillarOptions.find((o) => o.id === pid)?.name ?? pid).join(', ')}
                  </span>
                )}
              </div>
              <button type="button" className={styles.removeBtn} onClick={() => removeCustom(p.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.addCustom}>
        <div className={styles.addRow}>
          <input
            className={styles.customInput}
            type="text"
            placeholder="Nome do pilar (ex: Skate, Música...)"
            value={newPillarName}
            maxLength={30}
            onChange={(e) => setNewPillarName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canAddPillar && addCustomPillar()}
          />
          {canAddPillar && allPillarOptions.length > 0 && (
            <button
              type="button"
              className={`${styles.parentToggle} ${showParentPicker ? styles.parentToggleActive : ''}`}
              onClick={() => setShowParentPicker((v) => !v)}
            >
              ⬆ Pai
            </button>
          )}
        </div>

        {showParentPicker && allPillarOptions.length > 0 && (
          <div className={styles.parentPicker}>
            <p className={styles.parentPickerLabel}>Faz parte de qual(is) pilar(es)?</p>
            <div className={styles.parentChips}>
              {allPillarOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.parentChip} ${selectedParents.includes(opt.id) ? styles.parentChipSelected : ''}`}
                  onClick={() => toggleParent(opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {canAddPillar && (
          <button type="button" className={styles.addBtn} onClick={addCustomPillar}>
            + Adicionar{selectedParents.length > 0 ? ' como sub-pilar' : ''}
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
