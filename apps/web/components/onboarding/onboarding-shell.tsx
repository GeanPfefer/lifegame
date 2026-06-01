'use client';

import Link from 'next/link';
import styles from './onboarding-shell.module.css';

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
}

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  backHref,
  children,
}: OnboardingShellProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Progress */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.topRow}>
          {backHref
            ? <Link href={backHref} className={styles.backBtn}>← Voltar</Link>
            : <span />
          }
          <p className={styles.stepLabel}>Etapa {step} de {totalSteps}</p>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
