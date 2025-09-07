
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';
import BottomNav from '@/components/layout/bottom-nav';
import { cn } from '@/lib/utils';
import { CartProvider } from './use-cart';
import SplashScreen from '@/app/splash/page';

const ONBOARDING_KEY = 'eatme-onboarding-complete';
const SPLASH_KEY = 'eatme-splash-shown';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFoodPage = pathname.startsWith('/food');
  const isCartPage = pathname === '/cart';
  const isCheckoutPage = pathname === '/checkout';

  const showBottomNav = !isCartPage && !isCheckoutPage;

  return (
    <div className="relative flex min-h-screen flex-col">
      <main className={cn("flex-1", showBottomNav && "pb-20")}>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [splashShown, setSplashShown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const onboardingStored = localStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(onboardingStored === 'true');
      
      const splashStored = sessionStorage.getItem(SPLASH_KEY);
      setSplashShown(splashStored === 'true');

    } catch (error) {
      console.error('Failed to read from storage', error);
      setHasCompletedOnboarding(false);
      setSplashShown(true); // Don't show splash/onboarding on error
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!splashShown && isLoaded) {
      const timer = setTimeout(() => {
        try {
            sessionStorage.setItem(SPLASH_KEY, 'true');
        } catch(e) {
            console.error("Failed to set sessionStorage", e);
        }
        setSplashShown(true);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [splashShown, isLoaded]);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  };
  
  const showSplash = isLoaded && !splashShown;
  const showOnboarding = isLoaded && splashShown && !hasCompletedOnboarding && pathname !== '/onboarding' && !pathname.startsWith('/login') && !pathname.startsWith('/signup');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  const value = { hasCompletedOnboarding, completeOnboarding };

  const renderContent = () => {
    if (showSplash) return <SplashScreen />;
    if (showOnboarding) return <OnboardingPage />;
    if (isAuthPage) return <>{children}</>;
    return <AppLayout>{children}</AppLayout>;
  }

  return (
    <OnboardingContext.Provider value={value}>
       <CartProvider>
            {renderContent()}
       </CartProvider>
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
