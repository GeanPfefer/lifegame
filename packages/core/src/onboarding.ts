import type { OnboardingData, PillarId, PillarConfig } from '@lifegame/types';
import { DEFAULT_PILLARS, MIN_ACTIVE_PILLARS, MAX_PRIORITY_PILLARS } from '@lifegame/types';

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

export function validateStep3(_baseline: Partial<Record<PillarId, number>>): string | null {
  // Baseline é opcional — o usuário pode deixar padrão (5)
  return null;
}

export function validateStep4(priorityIds: PillarId[], selectedIds: PillarId[]): string | null {
  if (priorityIds.length === 0) return 'Escolha pelo menos 1 pilar prioritário.';
  if (priorityIds.length > MAX_PRIORITY_PILLARS)
    return `Máximo ${MAX_PRIORITY_PILLARS} pilares prioritários.`;
  const invalid = priorityIds.find((id) => !selectedIds.includes(id));
  if (invalid) return 'Pilar prioritário não está na lista de pilares ativos.';
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

/** Retorna o baseline completo, preenchendo 5 para pilares sem valor. */
export function normalizeBaseline(
  pillars: PillarConfig[],
  raw: Partial<Record<PillarId, number>>
): Record<PillarId, number> {
  return Object.fromEntries(
    pillars.map((p) => [p.id, raw[p.id] ?? 5])
  ) as Record<PillarId, number>;
}

export function buildOnboardingData(
  name: string,
  selectedIds: PillarId[],
  customPillars: Pick<PillarConfig, 'id' | 'name' | 'xpRate'>[],
  rawBaseline: Partial<Record<PillarId, number>>,
  priorityIds: PillarId[]
): OnboardingData {
  const allPillars = buildActivePillars(selectedIds, customPillars);
  return {
    name: name.trim(),
    selectedPillarIds: selectedIds,
    customPillars,
    pillarBaseline: normalizeBaseline(allPillars, rawBaseline),
    priorityPillarIds: priorityIds,
  };
}
