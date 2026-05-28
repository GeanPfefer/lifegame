'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { buildActivePillars, buildOnboardingData } from '@lifegame/core';
import { createClient } from '@/lib/supabase/client';
import styles from './step-5.module.css';

export default function Step5Page() {
  const router = useRouter();
  const { state } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePillars = buildActivePillars(state.selectedPillarIds, state.customPillars);

  async function handleStart() {
    setLoading(true);
    setError(null);

    const data = buildOnboardingData(
      state.name,
      state.selectedPillarIds,
      state.customPillars,
      state.baseline,
      state.priorityPillarIds
    );

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Usuário não autenticado.');

      // 1. Atualiza o nome e marca onboarding completo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Cria os pilares do usuário
      const pillarRows = activePillars.map((pillar, index) => ({
        user_id: user.id,
        catalog_id: pillar.isDefault ? pillar.id : null,
        name: pillar.name,
        xp_rate: pillar.xpRate,
        is_priority: data.priorityPillarIds.includes(pillar.id),
        baseline_score: data.pillarBaseline[pillar.id] ?? 5,
        sort_order: index,
      }));

      const { error: pillarsError } = await supabase
        .from('user_pillars')
        .insert(pillarRows);

      if (pillarsError) throw pillarsError;

      router.push('/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={5}
      totalSteps={5}
      title={`Pronto, ${state.name || 'Jogador'}!`}
      subtitle="Esses valores são sua linha de base. Cada ação registrada constrói seu personagem a partir daqui."
    >
      {/* Character card */}
      <div className={styles.characterCard}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNumber}>1</span>
          <span className={styles.levelLabel}>Nível</span>
        </div>
        <div className={styles.characterInfo}>
          <p className={styles.characterName}>{state.name || 'Jogador'}</p>
          <p className={styles.era}>Era: Despertar</p>
        </div>
      </div>

      {/* Pillars summary */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pilares ativos</h3>
        <div className={styles.pillarGrid}>
          {activePillars.map((pillar) => {
            const baseline = state.baseline[pillar.id] ?? 5;
            const isPriority = state.priorityPillarIds.includes(pillar.id);
            return (
              <div
                key={pillar.id}
                className={`${styles.pillarItem} ${isPriority ? styles.priority : ''}`}
              >
                <span className={styles.pillarName}>{pillar.name}</span>
                <span className={styles.pillarBaseline}>{baseline}/10</span>
                {isPriority && <span className={styles.priorityTag}>foco</span>}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <OnboardingButton onClick={handleStart} loading={loading}>
        Começar a jornada →
      </OnboardingButton>
    </OnboardingShell>
  );
}
