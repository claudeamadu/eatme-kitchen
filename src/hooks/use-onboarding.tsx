
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
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
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
      // Fallback safely
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
      }, 3000); // 3 seconds
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
    // 1. Show Splash if not shown yet or if auth/storage is not loaded
    if (!isLoaded || !splashShown) {
      return <SplashScreen />;
    }

    // After splash, wait for auth to be loaded
    if (!authLoaded) {
       return (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
       )
    }

    // 2. If auth is loaded and user is logged in
    if (user) {
        // If user is logged in but trying to access auth pages, redirect to home
        if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
            router.replace('/');
            return <AppLayout><div /></AppLayout>; // Render empty while redirecting
        }
        return <AppLayout>{children}</AppLayout>;
    }
    
    // 3. If auth is loaded but no user (logged out)
    if (!user) {
        // If onboarding is not complete, show it
        if (!hasCompletedOnboarding) {
            return <OnboardingPage />;
        }
        // If onboarding is complete, but user is trying to access other pages, redirect to login
        if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/onboarding')) {
             router.replace('/login');
             return (
                <div className="fixed inset-0 bg-background flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            );
        }
        // Allow access to login/signup pages
        return <>{children}</>;
    }
    
    // Fallback loading state
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
