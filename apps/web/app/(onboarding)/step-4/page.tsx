'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { OnboardingButton } from '@/components/onboarding/onboarding-button';
import { PillarQuestion } from '@/components/onboarding/PillarQuestion';
import { useOnboarding } from '@/contexts/onboarding-context';
import { buildActivePillars } from '@anima/core';
import { getQuestionsForPillar } from '@/lib/pillar-questions';
import type { PillarAnswers } from '@/contexts/onboarding-context';
import styles from './step-4.module.css';

export default function Step4Page() {
  const router = useRouter();
  const { state, setPillarContext } = useOnboarding();

  const allPillars = buildActivePillars(state.selectedPillarIds, state.customPillars);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState<PillarAnswers>({});

  const currentPillar = allPillars[currentIndex];
  const questions     = currentPillar ? getQuestionsForPillar(currentPillar.id) : [];
  const isLast        = currentIndex === allPillars.length - 1;

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return Array.isArray(a) ? a.length > 0 : (a ?? '').trim() !== '';
  }).length;
  const canAdvance = answeredCount > 0;

  function handleAnswer(questionId: string, value: string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (currentPillar) setPillarContext(currentPillar.id, answers);
    if (isLast) {
      router.push('/step-5');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswers({});
    }
  }

  function handleSkip() {
    if (isLast) {
      router.push('/step-5');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswers({});
    }
  }

  if (!currentPillar) {
    router.push('/step-5');
    return null;
  }

  return (
    <OnboardingShell
      step={4}
      totalSteps={5}
      title={currentPillar.name}
      subtitle={`Pilar ${currentIndex + 1} de ${allPillars.length} — suas respostas ajudam o app a te orientar melhor`}
      backHref="/step-3"
    >
      <div className={styles.progress}>
        {allPillars.map((p, i) => (
          <div
            key={p.id}
            className={`${styles.dot} ${i < currentIndex ? styles.done : ''} ${i === currentIndex ? styles.current : ''}`}
          />
        ))}
      </div>

      <div className={styles.questions}>
        {questions.map((q) => (
          <PillarQuestion
            key={q.id}
            question={q}
            value={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []}
            onChange={(val) => handleAnswer(q.id, val)}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.skipBtn} onClick={handleSkip}>
          Pular
        </button>
        <OnboardingButton onClick={handleNext} disabled={!canAdvance}>
          {isLast ? 'Ver resumo →' : 'Próximo pilar →'}
        </OnboardingButton>
      </div>
    </OnboardingShell>
  );
}
