
'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/layout/bottom-nav';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/hooks/use-onboarding';
import { DataDisclosureDialog } from '@/components/data-disclosure-dialog';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showDataDisclosure, handleDisclosureAccept, handleDisclosureDeny } = useOnboarding();
  const pagesWithBottomNav = ['/', '/menu', '/orders', '/settings'];
  const showBottomNav = pagesWithBottomNav.includes(pathname);

  // Don't show app layout for auth or onboarding pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/onboarding')) {
      return <>{children}</>;
  }
  
  if (showDataDisclosure) {
      return (
          <DataDisclosureDialog 
              onAllow={handleDisclosureAccept}
              onDeny={handleDisclosureDeny}
          />
      );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <main className={cn("flex-1", showBottomNav && "pb-24")}>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
