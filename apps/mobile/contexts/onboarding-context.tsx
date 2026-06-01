import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PillarId, PillarConfig } from '@anima/types';
import { getDefaultPillarIds } from '@anima/core';

interface OnboardingState {
  name: string;
  selectedPillarIds: PillarId[];
  customPillars: Pick<PillarConfig, 'id' | 'name' | 'xpRate'>[];
}

interface OnboardingContextValue {
  state: OnboardingState;
  setName: (name: string) => void;
  setPillars: (
    ids: PillarId[],
    custom: OnboardingState['customPillars'],
  ) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const INITIAL_STATE: OnboardingState = {
  name: '',
  selectedPillarIds: getDefaultPillarIds(),
  customPillars: [],
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const setName = (name: string) => setState((s) => ({ ...s, name }));

  const setPillars = (
    ids: PillarId[],
    custom: OnboardingState['customPillars'],
  ) => setState((s) => ({ ...s, selectedPillarIds: ids, customPillars: custom }));

  return (
    <OnboardingContext.Provider value={{ state, setName, setPillars }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
