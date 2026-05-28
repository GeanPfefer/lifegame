import type { Quest, QuestMission, ContextEvent } from '@lifegame/types';
import { calculateFinancialEventXP, PHYSICAL_ACHIEVEMENT_XP, MEANINGFUL_CONNECTION_XP } from './xp';

export function isQuestComplete(quest: Quest): boolean {
  return quest.missions.length > 0 && quest.missions.every((m) => m.completedAt !== null);
}

export function getCompletedMissions(quest: Quest): QuestMission[] {
  return quest.missions.filter((m) => m.completedAt !== null);
}

export function getQuestProgress(quest: Quest): number {
  if (quest.missions.length === 0) return 0;
  return getCompletedMissions(quest).length / quest.missions.length;
}

export function calculateContextEventXP(
  event: Pick<ContextEvent, 'anchorType' | 'anchorValue'>
): number {
  switch (event.anchorType) {
    case 'financial':
      return calculateFinancialEventXP(event.anchorValue ?? 0);
    case 'physical_achievement':
      return PHYSICAL_ACHIEVEMENT_XP;
    case 'meaningful_connection':
      return MEANINGFUL_CONNECTION_XP;
  }
}
