
'use client';

import { useOnboarding } from '@/hooks/use-onboarding';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, ShoppingBag, Users, Utensils, MessageSquare, BarChart, LogOut, Megaphone, Calendar, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: ShoppingBag },
    { href: '/admin/orders', label: 'Orders', icon: ReceiptText },
    { href: '/admin/menu', label: 'Menu', icon: Utensils },
    { href: '/admin/reservations', label: 'Reservations', icon: Calendar },
    { href: '/admin/promos', label: 'Promos', icon: Megaphone },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/finance', label: 'Finance', icon: BarChart },
    { href: '/admin/messaging', label: 'Messaging', icon: MessageSquare },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

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
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
       <aside className="w-64 bg-background p-6 flex flex-col justify-between border-r">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary mb-8">Admin Panel</h1>
                <nav className="space-y-2">
                {navItems.map(item => (
                     <Link href={item.href} key={item.href}>
                        <Button variant={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin') ? 'secondary' : 'ghost'} className="w-full justify-start">
                            <item.icon className="mr-2 h-4 w-4" /> {item.label}
                        </Button>
                    </Link>
                ))}
                </nav>
            </div>
            <div>
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
