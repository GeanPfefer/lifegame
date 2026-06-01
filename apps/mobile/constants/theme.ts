/** Paleta espelhando as CSS variables de apps/web/app/globals.css */
export const colors = {
  bg: '#0a0a0a',
  bgSurface: '#141414',
  bgElevated: '#1e1e1e',
  border: '#2a2a2a',
  borderFocus: '#444444',
  textPrimary: '#f5f5f5',
  textSecondary: '#888888',
  textMuted: '#555555',
  accent: '#7c5cfc',
  accentHover: '#9b80ff',
  accentSubtle: 'rgba(124, 92, 252, 0.12)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
} as const;
