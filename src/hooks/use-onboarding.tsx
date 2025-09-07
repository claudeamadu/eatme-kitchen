'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';

const ONBOARDING_KEY = 'eatme-onboarding-complete';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(storedValue === 'true');
    } catch (error) {
      console.error('Failed to read from localStorage', error);
      setHasCompletedOnboarding(false);
    }
    setIsLoaded(true);
  }, []);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  };
  
  const showOnboarding = isLoaded && !hasCompletedOnboarding && pathname !== '/onboarding';

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding }}>
      {showOnboarding ? <OnboardingPage /> : children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
