import type { ActivityBonusType, PillarConfig } from '@anima/types';

const BONUS_RATES: Record<ActivityBonusType, number> = {
  forgotten_pillar: 0.5,
  active_streak: 0.3,
  first_of_day: 0.2,
  active_quest: 0.4,
};

const MAX_BONUS_MULTIPLIER = 2.5;

export function calculateBonusMultiplier(bonuses: ActivityBonusType[]): number {
  const total = bonuses.reduce((acc, b) => acc + BONUS_RATES[b], 1);
  return Math.min(total, MAX_BONUS_MULTIPLIER);
}

export function calculateActivityXP(
  durationMinutes: number,
  pillar: PillarConfig,
  bonuses: ActivityBonusType[]
): { baseXP: number; bonusMultiplier: number; totalXP: number } {
  const baseXP = Math.round(durationMinutes * pillar.xpRate);
  const bonusMultiplier = calculateBonusMultiplier(bonuses);
  const totalXP = Math.round(baseXP * bonusMultiplier);
  return { baseXP, bonusMultiplier, totalXP };
}

/** XP para evento financeiro: valor em R$ ÷ 10 */
export function calculateFinancialEventXP(valueInReais: number): number {
  return Math.round(Math.abs(valueInReais) / 10);
}

/** XP para conquista física inédita (primeira maratona, etc.) */
export const PHYSICAL_ACHIEVEMENT_XP = 300;

/** XP para conexão significativa (binário) */
export const MEANINGFUL_CONNECTION_XP = 80;

/** XP para mudança de estado: calculado pelo delta */
export function calculateStateChangeDeltaXP(delta: number): number {
  return Math.abs(Math.round(delta));
}
