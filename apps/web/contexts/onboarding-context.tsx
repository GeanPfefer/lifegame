'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PillarId, PillarConfig } from '@lifegame/types';
import { getDefaultPillarIds } from '@lifegame/core';

interface OnboardingState {
  name: string;
  selectedPillarIds: PillarId[];
  customPillars: Pick<PillarConfig, 'id' | 'name' | 'xpRate'>[];
  baseline: Partial<Record<PillarId, number>>;
  priorityPillarIds: PillarId[];
}

interface OnboardingContextValue {
  state: OnboardingState;
  setName: (name: string) => void;
  setPillars: (ids: PillarId[], custom: OnboardingState['customPillars']) => void;
  setBaseline: (baseline: Partial<Record<PillarId, number>>) => void;
  setPriorities: (ids: PillarId[]) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const INITIAL_STATE: OnboardingState = {
  name: '',
  selectedPillarIds: getDefaultPillarIds(),
  customPillars: [],
  baseline: {},
  priorityPillarIds: [],
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const setName = (name: string) => setState((s) => ({ ...s, name }));

  const setPillars = (
    ids: PillarId[],
    custom: OnboardingState['customPillars']
  ) => setState((s) => ({ ...s, selectedPillarIds: ids, customPillars: custom }));

  const setBaseline = (baseline: Partial<Record<PillarId, number>>) =>
    setState((s) => ({ ...s, baseline }));

  const setPriorities = (priorityPillarIds: PillarId[]) =>
    setState((s) => ({ ...s, priorityPillarIds }));

  return (
    <OnboardingContext.Provider value={{ state, setName, setPillars, setBaseline, setPriorities }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
