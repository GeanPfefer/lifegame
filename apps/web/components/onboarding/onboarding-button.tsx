'use client';

import styles from './onboarding-button.module.css';

interface OnboardingButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}

export function OnboardingButton({
  onClick,
  type = 'button',
  disabled,
  loading,
  variant = 'primary',
  children,
}: OnboardingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.btn} ${styles[variant]}`}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}
