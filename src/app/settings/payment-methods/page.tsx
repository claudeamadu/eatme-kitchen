
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, MoreVertical, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const wallets = [
  {
    name: 'Sylvia',
    network: 'MTN Mobile Money',
    number: '055 124 5566',
    logo: 'https://picsum.photos/100/100?random=40',
    logoHint: 'MTN logo'
  },
   {
    name: 'Mummy',
    network: 'Vodafone Cash',
    number: '050 333 4444',
    logo: 'https://picsum.photos/100/100?random=41',
    logoHint: 'vodafone logo'
  },
];

export default function PaymentMethodsPage() {
  const router = useRouter();

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
          {wallets.map((wallet, index) => (
            <Card key={index} className="p-4 flex items-center gap-4 shadow-lg rounded-2xl">
              <Image src={wallet.logo} alt={wallet.network} width={48} height={48} data-ai-hint={wallet.logoHint} className="w-12 h-12 rounded-lg object-contain" />
              <div className="flex-grow">
                <p className="font-bold text-lg">{wallet.name}</p>
                <p className="text-sm text-muted-foreground">{wallet.network} - {wallet.number}</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </Card>
          ))}
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
