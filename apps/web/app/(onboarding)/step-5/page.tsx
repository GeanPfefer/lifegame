'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { buildActivePillars } from '@lifegame/core';
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

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Usuário não autenticado.');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: state.name.trim(),
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const pillarRows = activePillars.map((pillar, index) => ({
        user_id: user.id,
        catalog_id: pillar.isDefault ? pillar.id : null,
        name: pillar.name,
        xp_rate: pillar.xpRate,
        sort_order: index,
      }));

      const { error: pillarsError } = await supabase
        .from('user_pillars')
        .insert(pillarRows);

      if (pillarsError) throw pillarsError;

      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={3}
      totalSteps={3}
      title={`Pronto, ${state.name || 'Jogador'}!`}
      subtitle="Esses são seus pilares. Cada ação registrada constrói seu personagem a partir daqui."
    >
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

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pilares ativos</h3>
        <div className={styles.pillarGrid}>
          {activePillars.map((pillar) => (
            <div key={pillar.id} className={styles.pillarItem}>
              <span className={styles.pillarName}>{pillar.name}</span>
              <span className={styles.pillarRate}>{pillar.xpRate}× XP/min</span>
            </div>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <OnboardingButton onClick={handleStart} loading={loading}>
        Começar a jornada →
      </OnboardingButton>
    </OnboardingShell>
  );
}
