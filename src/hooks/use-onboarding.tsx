'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';
import BottomNav from '@/components/layout/bottom-nav';
import { cn } from '@/lib/utils';

const ONBOARDING_KEY = 'eatme-onboarding-complete';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isFoodPage = pathname.startsWith('/food');

  const showBottomNav = !isAuthPage;

  return (
    <div className="relative flex min-h-screen flex-col">
      <main className={cn("flex-1", !isFoodPage && "pb-20")}>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
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

  const value = { hasCompletedOnboarding, completeOnboarding };

  return (
    <OnboardingContext.Provider value={value}>
      {showOnboarding ? (
        <OnboardingPage />
      ) : isAuthPage ? (
        children
      ) : (
        <AppLayout>{children}</AppLayout>
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
