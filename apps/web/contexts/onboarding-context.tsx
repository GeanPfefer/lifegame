'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PillarId, PillarConfig } from '@anima/types';
import { getDefaultPillarIds } from '@anima/core';
import { DEFAULT_PILLARS } from '@anima/types';
import type { ArchetypeResult } from '@/lib/archetypes';

// Respostas de cada pergunta de um pilar: { [questionId]: string[] | string }
export type PillarAnswers = Record<string, string[] | string>;

interface OnboardingState {
  name: string;
  archetypeAnswers: Record<string, string>;  // respostas brutas do quiz
  archetypeResult: ArchetypeResult | null;   // percentuais calculados
  selectedPillarIds: PillarId[];
  customPillars: (Pick<PillarConfig, 'id' | 'name' | 'xpRate'> & { parentIds?: string[] })[];
  pillarContexts: Record<string, PillarAnswers>;
}

interface OnboardingContextValue {
  state: OnboardingState;
  setName: (name: string) => void;
  setArchetype: (answers: Record<string, string>, result: ArchetypeResult) => void;
  setPillars: (ids: PillarId[], custom: OnboardingState['customPillars']) => void;
  allPillarOptions: { id: string; name: string }[];
  setPillarContext: (pillarId: string, answers: PillarAnswers) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const INITIAL_STATE: OnboardingState = {
  name: '',
  archetypeAnswers: {},
  archetypeResult: null,
  selectedPillarIds: getDefaultPillarIds(),
  customPillars: [],
  pillarContexts: {},
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const setName = (name: string) => setState((s) => ({ ...s, name }));

  const setArchetype = (answers: Record<string, string>, result: ArchetypeResult) =>
    setState((s) => ({ ...s, archetypeAnswers: answers, archetypeResult: result }));

  const setPillars = (
    ids: PillarId[],
    custom: OnboardingState['customPillars']
  ) => setState((s) => ({ ...s, selectedPillarIds: ids, customPillars: custom }));

  const setPillarContext = (pillarId: string, answers: PillarAnswers) =>
    setState((s) => ({
      ...s,
      pillarContexts: { ...s.pillarContexts, [pillarId]: answers },
    }));

  // Todos os pilares disponíveis como pais (padrões selecionados + custom já adicionados)
  const allPillarOptions = [
    ...DEFAULT_PILLARS
      .filter((p) => state.selectedPillarIds.includes(p.id))
      .map((p) => ({ id: p.id, name: p.name })),
    ...state.customPillars.map((p) => ({ id: p.id, name: p.name })),
  ];

  return (
    <OnboardingContext.Provider value={{ state, setName, setArchetype, setPillars, setPillarContext, allPillarOptions }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
