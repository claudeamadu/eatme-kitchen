
'use client';

import { useOnboarding } from '@/hooks/use-onboarding';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useOnboarding();
  const router = useRouter();

  if (user === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !user.email?.endsWith('@eatmekitchen.org')) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return <div className="min-h-screen bg-muted/40">{children}</div>;
}
