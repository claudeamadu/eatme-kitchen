'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Bug, CalendarClock, Receipt, MessageSquareMore } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const helpItems = [
  {
    icon: Bug,
    title: 'Report a bug',
    description: 'Let us know any specific issue you are experiencing.',
    href: '#',
  },
  {
    icon: CalendarClock,
    title: 'Reservation assistance',
    description: 'Need help with booking, modifying a table reservation? Click here for support.',
    href: '#',
  },
  {
    icon: Receipt,
    title: 'Refunds & Cancellations',
    description: 'Need to cancel an order or request a refund? Here\'s how to do it.',
    href: '#',
  },
  {
    icon: MessageSquareMore,
    title: 'Other feedback',
    description: 'Let us know how we can serve you better.',
    href: '#',
  },
];

export default function HelpCenterPage() {
  const router = useRouter();

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Help Center</h1>
      </header>

      <main className="container mx-auto px-4">
         <Card className="shadow-lg">
            <CardContent className="p-0">
                <ul className="divide-y">
                    {helpItems.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href} passHref>
                                <div className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
