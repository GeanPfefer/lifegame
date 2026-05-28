'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { calculateBonusMultiplier } from '@lifegame/core';
import { getActivityBonuses, logActivity } from '../actions';
import type { ActivityBonusType } from '@lifegame/types';
import styles from './LogActivityModal.module.css';

type Pillar = { id: string; name: string; xp_rate: number };

const BONUS_LABELS: Record<ActivityBonusType, string> = {
  first_of_day:    'Primeiro do dia',
  forgotten_pillar:'Pilar esquecido',
  active_streak:   'Sequência ativa',
  active_quest:    'Quest ativa',
};

const BONUS_PCT: Record<ActivityBonusType, number> = {
  first_of_day:    20,
  forgotten_pillar:50,
  active_streak:   30,
  active_quest:    40,
};

const DURATION_PRESETS = [15, 30, 45, 60, 90];

export default function LogActivityModal({ pillars }: { pillars: Pillar[] }) {
  const router = useRouter();
  const [open, setOpen]                     = useState(false);
  const [selectedId, setSelectedId]         = useState('');
  const [duration, setDuration]             = useState(30);
  const [note, setNote]                     = useState('');
  const [bonusCache, setBonusCache]         = useState<Record<string, ActivityBonusType[]>>({});
  const [loadingBonuses, setLoadingBonuses] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [success, setSuccess]               = useState<number | null>(null);
  const [errorMsg, setErrorMsg]             = useState('');

  const handlePillarSelect = useCallback(async (id: string) => {
    setSelectedId(id);
    if (bonusCache[id] !== undefined) return;
    setLoadingBonuses(true);
    const bonuses = await getActivityBonuses(id);
    setBonusCache(prev => ({ ...prev, [id]: bonuses }));
    setLoadingBonuses(false);
  }, [bonusCache]);

  const handleClose = () => {
    setOpen(false);
    setSelectedId('');
    setDuration(30);
    setNote('');
    setSuccess(null);
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (!selectedId || duration <= 0) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { totalXP } = await logActivity({ pillarId: selectedId, durationMinutes: duration, note });
      setSuccess(totalXP);
      setTimeout(() => {
        router.refresh();
        handleClose();
      }, 1800);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao registrar');
      setSubmitting(false);
    }
  };

  const currentBonuses = bonusCache[selectedId] ?? [];
  const selectedPillar = pillars.find(p => p.id === selectedId);

  const xpPreview = selectedPillar && duration > 0
    ? (() => {
        const baseXP = Math.round(duration * selectedPillar.xp_rate);
        const multiplier = calculateBonusMultiplier(currentBonuses);
        return { baseXP, multiplier, totalXP: Math.round(baseXP * multiplier) };
      })()
    : null;

  if (!open) {
    return (
      <button className={styles.fab} onClick={() => setOpen(true)}>
        + Registrar atividade
      </button>
    );
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose} />

      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nova atividade</h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Fechar">✕</button>
        </div>

        {success !== null ? (
          <div className={styles.success}>
            <div className={styles.successXP}>+{success} XP</div>
            <p className={styles.successMsg}>Atividade registrada!</p>
          </div>
        ) : (
          <>
            <div className={styles.section}>
              <p className={styles.label}>Pilar</p>
              <div className={styles.pillarGrid}>
                {pillars.map(p => (
                  <button
                    key={p.id}
                    className={`${styles.pill} ${selectedId === p.id ? styles.pillActive : ''}`}
                    onClick={() => handlePillarSelect(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Tempo</p>
              <div className={styles.durationRow}>
                {DURATION_PRESETS.map(d => (
                  <button
                    key={d}
                    className={`${styles.durationChip} ${duration === d ? styles.durationChipActive : ''}`}
                    onClick={() => setDuration(d)}
                  >
                    {d}min
                  </button>
                ))}
                <input
                  type="number"
                  className={styles.durationInput}
                  value={duration}
                  min={1}
                  max={480}
                  onChange={e => setDuration(Math.max(1, Math.min(480, Number(e.target.value) || 1)))}
                />
              </div>
            </div>

            {selectedPillar && (
              <div className={styles.xpCard}>
                {loadingBonuses ? (
                  <p className={styles.xpLoading}>Calculando bônus…</p>
                ) : xpPreview ? (
                  <>
                    <div className={styles.xpBase}>
                      {duration}min × {selectedPillar.xp_rate} = {xpPreview.baseXP} XP base
                    </div>
                    {currentBonuses.map(b => (
                      <div key={b} className={styles.xpBonus}>
                        ⚡ {BONUS_LABELS[b]} <span>+{BONUS_PCT[b]}%</span>
                      </div>
                    ))}
                    <div className={styles.xpTotal}>
                      {xpPreview.totalXP} XP
                      {xpPreview.multiplier > 1 && (
                        <span className={styles.xpMultiplier}> ×{xpPreview.multiplier.toFixed(2)}</span>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}

            <div className={styles.section}>
              <p className={styles.label}>
                Nota <span className={styles.optional}>(opcional)</span>
              </p>
              <textarea
                className={styles.noteInput}
                placeholder="O que você fez? Como foi?"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
              />
            </div>

            {errorMsg && <p className={styles.error}>{errorMsg}</p>}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!selectedId || duration <= 0 || submitting}
            >
              {submitting ? 'Registrando…' : 'Registrar'}
            </button>
          </>
        )}
      </div>
    </>
  );
}
