import type { PillarId, PillarConfig } from '@anima/types';
import { DEFAULT_PILLARS, MIN_ACTIVE_PILLARS } from '@anima/types';

// ─── Step validation ──────────────────────────────────────────

export function validateStep1(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Digite seu nome.';
  if (trimmed.length < 2) return 'Nome muito curto.';
  if (trimmed.length > 50) return 'Nome muito longo.';
  return null;
}

export function validateStep2(selectedIds: PillarId[], customPillars: PillarConfig[]): string | null {
  const total = selectedIds.length + customPillars.length;
  if (total < MIN_ACTIVE_PILLARS) return `Selecione pelo menos ${MIN_ACTIVE_PILLARS} pilares.`;
  if (total > 12) return 'Máximo de 12 pilares ativos.';
  return null;
}

// ─── Data builders ────────────────────────────────────────────

export function getDefaultPillarIds(): PillarId[] {
  return DEFAULT_PILLARS.map((p) => p.id);
}

export function buildActivePillars(
  selectedIds: PillarId[],
  customPillars: Pick<PillarConfig, 'id' | 'name' | 'xpRate'>[]
): PillarConfig[] {
  const defaults = DEFAULT_PILLARS.filter((p) => selectedIds.includes(p.id));
  const custom: PillarConfig[] = customPillars.map((c) => ({
    ...c,
    isDefault: false,
    isCustom: true,
  }));
  return [...defaults, ...custom];
}
