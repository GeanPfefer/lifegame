'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import { buildActivePillars } from '@anima/core';
import { createClient } from '@/lib/supabase/client';
import { ARCHETYPES, getDominantArchetype } from '@/lib/archetypes';
import styles from './step-5.module.css';

const WELCOME_PHRASES: Record<string, (name: string) => string> = {
  explorer:  (n) => `${n}, sua jornada vai ser ampla e cheia de descobertas. O Anima vai te acompanhar sem te prender — explore à vontade.`,
  focused:   (n) => `${n}, você sabe onde quer chegar. O Anima vai te ajudar a ir fundo e concluir o que importa.`,
  builder:   (n) => `${n}, consistência é sua força. O Anima vai registrar cada passo e mostrar o quanto você constrói com o tempo.`,
  visionary: (n) => `${n}, você pensa grande. O Anima vai conectar suas ações diárias com a visão de futuro que você carrega.`,
};

export default function Step5Page() {
  const router = useRouter();
  const { state, allPillarOptions } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const activePillars   = buildActivePillars(state.selectedPillarIds, state.customPillars);
  const dominant      = state.archetypeResult ? getDominantArchetype(state.archetypeResult) : null;
  const archetype     = dominant ? ARCHETYPES[dominant] : null;
  const welcomePhrase = dominant ? WELCOME_PHRASES[dominant]?.(state.name || 'Jogador') : null;

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
          archetype: state.archetypeResult ?? null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const pillarRows = activePillars.map((pillar, index) => ({
        user_id: user.id,
        catalog_id: pillar.isDefault ? pillar.id : null,
        name: pillar.name,
        xp_rate: pillar.xpRate,
        sort_order: index,
        context: state.pillarContexts[pillar.id] ?? null,
      }));

      const { data: insertedPillars, error: pillarsError } = await supabase
        .from('user_pillars')
        .insert(pillarRows)
        .select('id, catalog_id, name');
      if (pillarsError) throw pillarsError;

      // Salva relações pai → filho para sub-pilares
      const relationships: { parent_id: string; child_id: string }[] = [];
      for (const custom of state.customPillars) {
        if (!custom.parentIds?.length) continue;
        const child = insertedPillars?.find((p) => p.name === custom.name);
        if (!child) continue;
        for (const parentLocalId of custom.parentIds) {
          // parentLocalId pode ser um catalog_id (padrão) ou um nome (custom)
          const parent = insertedPillars?.find(
            (p) => p.catalog_id === parentLocalId || p.name === allPillarOptions.find((o) => o.id === parentLocalId)?.name
          );
          if (parent) relationships.push({ parent_id: parent.id, child_id: child.id });
        }
      }

      if (relationships.length > 0) {
        const { error: relError } = await supabase.from('pillar_relationships').insert(relationships);
        if (relError) throw relError;
      }

      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={5}
      totalSteps={5}
      title={`Pronto, ${state.name || 'Jogador'}!`}
      subtitle="Seu perfil está criado. Veja o que montamos para você."
      backHref="/step-4"
    >
      {/* Frase de boas-vindas personalizada */}
      {welcomePhrase && (
        <p className={styles.welcomePhrase}>{welcomePhrase}</p>
      )}

      {/* Card do personagem */}
      <div className={styles.characterCard}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNumber}>1</span>
          <span className={styles.levelLabel}>Nível</span>
        </div>
        <div className={styles.characterInfo}>
          <p className={styles.characterName}>{state.name || 'Jogador'}</p>
          <p className={styles.era}>Era: Despertar</p>
        </div>
        {archetype && (
          <div className={styles.archetypeBadge}>
            <span className={styles.archetypeEmoji}>{archetype.emoji}</span>
            <span className={styles.archetypeLabel}>{archetype.name}</span>
          </div>
        )}
      </div>

      {/* Arquétipo detalhado */}
      {archetype && state.archetypeResult && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Seu perfil</h3>
          <div className={styles.archetypeCard}>
            <div className={styles.archetypeBars}>
              {(Object.entries(state.archetypeResult) as [string, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([id, pct]) => (
                  <div key={id} className={styles.barRow}>
                    <span className={styles.barLabel}>
                      {ARCHETYPES[id as keyof typeof ARCHETYPES]?.emoji}{' '}
                      {ARCHETYPES[id as keyof typeof ARCHETYPES]?.name}
                    </span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.barPct}>{pct}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Pilares com contexto */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pilares ativos</h3>
        <div className={styles.pillarGrid}>
          {activePillars.map((pillar) => {
            const ctx = state.pillarContexts[pillar.id];
            const answers = ctx
              ? Object.values(ctx)
                  .flatMap((v) => (Array.isArray(v) ? v : [v]))
                  .filter(Boolean)
              : [];
            return (
              <div key={pillar.id} className={styles.pillarItem}>
                <span className={styles.pillarName}>{pillar.name}</span>
                {answers.length > 0 && (
                  <div className={styles.pillarTags}>
                    {answers.slice(0, 3).map((a) => (
                      <span key={a} className={styles.pillarTag}>{a}</span>
                    ))}
                    {answers.length > 3 && (
                      <span className={styles.pillarTag}>+{answers.length - 3}</span>
                    )}
                  </div>
                )}
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
