'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { useOnboarding } from '@/contexts/onboarding-context';
import {
  ARCHETYPE_QUESTIONS,
  ARCHETYPES,
  calculateArchetype,
  getDominantArchetype,
} from '@/lib/archetypes';
import type { ArchetypeResult } from '@/lib/archetypes';
import styles from './step-2.module.css';

type Phase = 'quiz' | 'result';

export default function Step2Page() {
  const router = useRouter();
  const { setArchetype } = useOnboarding();

  const [phase, setPhase]     = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult]   = useState<ArchetypeResult | null>(null);

  const answeredCount = Object.keys(answers).length;
  const canSubmit     = answeredCount === ARCHETYPE_QUESTIONS.length;

  function selectOption(questionId: string, label: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  }

  function handleSubmit() {
    const calc = calculateArchetype(answers);
    setResult(calc);
    setPhase('result');
  }

  function handleContinue() {
    if (!result) return;
    setArchetype(answers, result);
    router.push('/step-3');
  }

  if (phase === 'result' && result) {
    const dominant  = getDominantArchetype(result);
    const archetype = ARCHETYPES[dominant];
    const sorted    = (Object.entries(result) as [keyof ArchetypeResult, number][])
      .sort((a, b) => b[1] - a[1]);

    return (
      <OnboardingShell step={2} totalSteps={5} title="Seu perfil" subtitle="Combinação única baseada nas suas respostas" backHref="/step-2">
        <div className={styles.resultCard}>
          <span className={styles.emoji}>{archetype.emoji}</span>
          <h2 className={styles.archetypeName}>{archetype.name}</h2>
          <p className={styles.archetypeDesc}>{archetype.description}</p>
        </div>

        <div className={styles.bars}>
          {sorted.map(([id, pct]) => (
            <div key={id} className={styles.barRow}>
              <span className={styles.barLabel}>
                {ARCHETYPES[id].emoji} {ARCHETYPES[id].name}
              </span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.barPct}>{pct}%</span>
            </div>
          ))}
        </div>

        <OnboardingButton onClick={handleContinue}>
          Continuar →
        </OnboardingButton>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={2}
      totalSteps={5}
      title="Como você funciona?"
      subtitle={`${answeredCount} de ${ARCHETYPE_QUESTIONS.length} respondidas`}
      backHref="/step-1"
    >
      <div className={styles.questions}>
        {ARCHETYPE_QUESTIONS.map((q) => (
          <div key={q.id} className={styles.question}>
            <p className={styles.questionText}>{q.text}</p>
            <div className={styles.options}>
              {q.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`${styles.chip} ${answers[q.id] === opt.label ? styles.selected : ''}`}
                  onClick={() => selectOption(q.id, opt.label)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <OnboardingButton onClick={handleSubmit} disabled={!canSubmit}>
        Ver meu perfil →
      </OnboardingButton>
    </OnboardingShell>
  );
}
