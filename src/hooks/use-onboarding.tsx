
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';
import BottomNav from '@/components/layout/bottom-nav';
import { cn } from '@/lib/utils';
import { CartProvider } from './use-cart';
import SplashScreen from '@/app/splash/page';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const ONBOARDING_KEY = 'eatme-onboarding-complete';
const SPLASH_KEY = 'eatme-splash-shown';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  user: User | null | undefined;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pagesWithBottomNav = ['/', '/menu', '/orders', '/settings'];
  const showBottomNav = pagesWithBottomNav.includes(pathname);

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
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [authLoaded, setAuthLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const onboardingStored = localStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(onboardingStored === 'true');
      
      const splashStored = sessionStorage.getItem(SPLASH_KEY);
      setSplashShown(splashStored === 'true');

    } catch (error) {
      console.error('Failed to read from storage', error);
      setHasCompletedOnboarding(true); 
      setSplashShown(true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoaded && !splashShown) {
      const timer = setTimeout(() => {
        try {
            sessionStorage.setItem(SPLASH_KEY, 'true');
        } catch(e) {
            console.error("Failed to set sessionStorage", e);
        }
        setSplashShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, splashShown]);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  };
  
  const value = { hasCompletedOnboarding, completeOnboarding, user };
  
  const renderContent = () => {
    if (!isLoaded || !splashShown || !authLoaded) {
      return <SplashScreen />;
    }

    if (pathname.startsWith('/admin')) {
        return <>{children}</>;
    }
    
    if (user) {
        if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
            router.replace('/');
            return <AppLayout><div /></AppLayout>;
        }
        return <AppLayout>{children}</AppLayout>;
    }
    
    if (!user) {
        if (!hasCompletedOnboarding) {
            return <OnboardingPage />;
        }
        if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/onboarding')) {
             router.replace('/login');
             return (
                <div className="fixed inset-0 bg-background flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            );
        }
        return <>{children}</>;
    }
    
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
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
