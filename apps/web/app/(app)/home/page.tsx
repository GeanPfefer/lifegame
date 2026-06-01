import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getXPToNextLevel, getTotalXPForLevel, getEraForLevel, getCharacterLevel } from '@anima/core';
import LifeRadar from './_components/LifeRadar';
import LogActivityModal from './_components/LogActivityModal';
import styles from './home.module.css';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/step-1');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/step-1');

  const { data: pillarsData } = await supabase
    .from('user_pillars')
    .select('id, name, xp_rate, xp_total, level, is_active, is_priority')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order');

  const pillars = pillarsData ?? [];
  const characterLevel = getCharacterLevel(pillars.map((p) => p.level));
  const era = getEraForLevel(characterLevel);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.name}>{profile.name}</h1>
        <div className={styles.characterMeta}>
          <span className={styles.level}>Nível {characterLevel}</span>
          <span className={styles.separator}>·</span>
          <span className={styles.era}>{era.name}</span>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.radarSection}>
          <p className={styles.sectionLabel}>Radar de vida</p>
          {pillars.length >= 3 ? (
            <LifeRadar pillars={pillars} />
          ) : (
            <p className={styles.empty}>Nenhum pilar registrado.</p>
          )}
        </section>

        <section className={styles.pillarsSection}>
          <p className={styles.sectionLabel}>Pilares</p>
          {pillars.length === 0 ? (
            <p className={styles.empty}>Complete o onboarding para ver seus pilares.</p>
          ) : (
            <div className={styles.pillarList}>
              {pillars.map((p) => {
                const levelStart = getTotalXPForLevel(p.level);
                const levelEnd = getTotalXPForLevel(p.level + 1);
                const progress =
                  levelEnd > levelStart
                    ? Math.max(0, (p.xp_total - levelStart) / (levelEnd - levelStart))
                    : 1;
                const xpToNext = getXPToNextLevel(p.xp_total);

                return (
                  <div
                    key={p.id}
                    className={`${styles.pillarCard} ${p.is_priority ? styles.pillarPriority : ''}`}
                  >
                    <div className={styles.pillarTop}>
                      <span className={styles.pillarName}>{p.name}</span>
                      <span className={styles.pillarLevel}>Nv. {p.level}</span>
                    </div>
                    <div className={styles.xpBar}>
                      <div
                        className={styles.xpFill}
                        style={{ width: `${Math.min(progress * 100, 100).toFixed(1)}%` }}
                      />
                    </div>
                    <div className={styles.pillarBottom}>
                      <span className={styles.xpTotal}>
                        {p.xp_total.toLocaleString('pt-BR')} XP
                      </span>
                      {p.level < 50 && (
                        <span className={styles.xpToNext}>
                          +{xpToNext} para Nv. {p.level + 1}
                        </span>
                      )}
                      {p.is_priority && (
                        <span className={styles.priorityBadge}>foco</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className={styles.footer}>
        <LogActivityModal pillars={pillars.map(p => ({ id: p.id, name: p.name, xp_rate: p.xp_rate }))} />
      </div>
    </main>
  );
}
