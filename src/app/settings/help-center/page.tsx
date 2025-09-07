'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Bug, CalendarClock, Receipt, MessageSquareMore } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const helpItems = [
  {
    id: 'report-bug',
    icon: Bug,
    title: 'Report a bug',
    description: 'Let us know any specific issue you are experiencing.',
    href: '#',
  },
  {
    id: 'reservation-assistance',
    icon: CalendarClock,
    title: 'Reservation assistance',
    description: 'Need help with booking, modifying a table reservation? Click here for support.',
    href: '#',
  },
  {
    id: 'refunds-cancellations',
    icon: Receipt,
    title: 'Refunds & Cancellations',
    description: 'Need to cancel an order or request a refund? Here\'s how to do it.',
    href: '#',
  },
  {
    id: 'other-feedback',
    icon: MessageSquareMore,
    title: 'Other feedback',
    description: 'Let us know how we can serve you better.',
    href: '#',
  },
];

export default function HelpCenterPage() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleItemClick = (id: string) => {
    if (id === 'report-bug') {
      setIsSheetOpen(true);
    } else {
      // router.push(href);
    }
  };


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
                            {item.id === 'report-bug' ? (
                               <button onClick={() => handleItemClick(item.id)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </button>
                            ) : (
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
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-6">
          <SheetHeader className="text-center mb-6">
            <SheetTitle className="text-xl font-bold font-headline">Report a bug</SheetTitle>
            <SheetDescription>Let us know any technical issue you're facing.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter the subject" className="h-12" />
             </div>
             <div className="space-y-2">
                <Label htmlFor="description">Describe the bug experienced as detailed as you can.</Label>
                <Textarea id="description" placeholder="Describe the issue..." rows={5} />
             </div>
          </div>
          <SheetFooter className="mt-6">
            <Button size="lg" className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsSheetOpen(false)}>
                Submit Report
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
