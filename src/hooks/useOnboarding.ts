import { useState, useCallback } from 'react';
import { KEYS, setItem, getItem } from '@src/utils/storage';
import type { OnboardingData } from '@src/types';

const TOTAL_STEPS = 4;

export function useOnboarding() {
  const [step, setStep] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [teenName, setTeenName] = useState('');

  const canContinue = useCallback((): boolean => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return selectedState.length > 0;
      case 2:
        return teenName.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, selectedState, teenName]);

  const next = useCallback(() => {
    if (step < TOTAL_STEPS - 1 && canContinue()) {
      setStep((s) => s + 1);
    }
  }, [step, canContinue]);

  const back = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step]);

  const complete = useCallback(async (): Promise<void> => {
    const data: OnboardingData = {
      state: selectedState,
      teenName: teenName.trim(),
      completedOnboarding: true,
    };
    await setItem(KEYS.onboarded, data);
  }, [selectedState, teenName]);

  return {
    step,
    totalSteps: TOTAL_STEPS,
    selectedState,
    setSelectedState,
    teenName,
    setTeenName,
    canContinue,
    next,
    back,
    complete,
  };
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const data = await getItem<OnboardingData>(KEYS.onboarded);
  return data?.completedOnboarding === true;
}

export async function getOnboardingData(): Promise<OnboardingData | null> {
  return getItem<OnboardingData>(KEYS.onboarded);
}
