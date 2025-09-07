'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';
import Header from '@/components/layout/header'; // Corrected import

const ONBOARDING_KEY = 'eatme-onboarding-complete';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">{children}</main>
    </div>
  );
}

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
  
  const showOnboarding = isLoaded && !hasCompletedOnboarding && pathname !== '/onboarding' && !pathname.startsWith('/login') && !pathname.startsWith('/signup');

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding }}>
      {showOnboarding ? <OnboardingPage /> : (
        isAuthPage ? children : <AppLayout>{children}</AppLayout>
      )}
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
