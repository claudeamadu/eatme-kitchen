
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, MoreVertical, PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOnboarding } from '@/hooks/use-onboarding';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { wallet } from '@/lib/types';


export default function PaymentMethodsPage() {
  const router = useRouter();
  const { user } = useOnboarding();
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const walletsQuery = query(collection(db, 'users', user.uid, 'wallets'));
      const unsubscribe = onSnapshot(walletsQuery, (querySnapshot) => {
        const userWallets: wallet[] = [];
        querySnapshot.forEach((doc) => {
          userWallets.push({ id: doc.id, ...doc.data() } as wallet);
        });
        setWallets(userWallets);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching wallets:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Payment Methods</h1>
      </header>

      <main className="container mx-auto px-4">
        <div className="space-y-4">
          {isLoading ? (
             <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card key={wallet.id} className="p-4 flex items-center gap-4 shadow-lg rounded-2xl">
                <Image src={wallet.logo} alt={wallet.network} width={48} height={48} data-ai-hint={wallet.logoHint} className="w-12 h-12 rounded-lg object-contain" />
                <div className="flex-grow">
                  <p className="font-bold text-lg">{wallet.name}</p>
                  <p className="text-sm text-muted-foreground">{wallet.network} - {wallet.number}</p>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No payment methods added yet.</p>
          )}

          <Link href="/settings/payment-methods/add" passHref>
             <button className="w-full flex items-center justify-center gap-2 p-4 text-center text-primary font-semibold border-2 border-dashed border-primary/50 rounded-2xl hover:bg-primary/5 transition-colors">
                <PlusCircle className="w-5 h-5" />
                <span>Add new wallet</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
