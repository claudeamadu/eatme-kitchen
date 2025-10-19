
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';
import { cn } from '@/lib/utils';
import { CartProvider } from './use-cart';
import { ReservationProvider } from './use-reservation';
import SplashScreen from '@/app/splash/page';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

const ONBOARDING_KEY = 'eatme-onboarding-complete';
const SPLASH_KEY = 'eatme-splash-shown';
const DATA_DISCLOSURE_KEY = 'eatme-data-disclosure-accepted';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  user: User | null | undefined;
  refreshUser: () => Promise<void>;
  showDataDisclosure: boolean;
  handleDisclosureAccept: () => void;
  handleDisclosureDeny: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [splashShown, setSplashShown] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [dataDisclosureAccepted, setDataDisclosureAccepted] = useState(true);
  const [showDataDisclosure, setShowDataDisclosure] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const onboardingStored = localStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(onboardingStored === 'true');
      
      const splashStored = sessionStorage.getItem(SPLASH_KEY);
      setSplashShown(splashStored === 'true');

      const disclosureStored = localStorage.getItem(DATA_DISCLOSURE_KEY);
      setDataDisclosureAccepted(disclosureStored === 'true');

    } catch (error) {
      console.error('Failed to read from storage', error);
      // Fail safe
      setHasCompletedOnboarding(true); 
      setSplashShown(true);
      setDataDisclosureAccepted(true);
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

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        await currentUser.reload();
        // Create a new user object to trigger re-renders
        setUser({...currentUser});
    }
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

  useEffect(() => {
    // If auth is loaded, user is logged in, and they haven't accepted the disclosure
    if (authLoaded && user && !dataDisclosureAccepted) {
      // And they are not on an auth-related page
      if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/onboarding')) {
        setShowDataDisclosure(true);
      }
    } else {
      setShowDataDisclosure(false);
    }
  }, [authLoaded, user, dataDisclosureAccepted, pathname]);


  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  };
  
  const handleDisclosureAccept = () => {
    try {
      localStorage.setItem(DATA_DISCLOSURE_KEY, 'true');
      setDataDisclosureAccepted(true);
      setShowDataDisclosure(false);
    } catch (error) {
      console.error('Failed to save data disclosure acceptance', error);
    }
  };

  const handleDisclosureDeny = () => {
    // Handle denial - for now, we'll just let them use the app without the feature.
    // In a real app, you might disable features that depend on this data.
    setShowDataDisclosure(false);
  };
  
  const value = { hasCompletedOnboarding, completeOnboarding, user, refreshUser, showDataDisclosure, handleDisclosureAccept, handleDisclosureDeny };
  
  const renderContent = () => {
    if (!isLoaded || !authLoaded) {
      return <SplashScreen />;
    }
    
    if (!splashShown) {
      return <SplashScreen />;
    }

    if (pathname.startsWith('/admin')) {
        return <>{children}</>;
    }
    
    if (user) {
        if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/onboarding')) {
            router.replace('/');
            return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
        }
        return <>{children}</>; // AppLayout is now a parent in RootLayout
    }
    
    if (!user) {
        if (!hasCompletedOnboarding) {
            if (pathname === '/onboarding') {
                return <OnboardingPage />;
            }
            router.replace('/onboarding');
            return <SplashScreen/>
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
            <ReservationProvider>
                {renderContent()}
            </ReservationProvider>
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
