
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Bug, CalendarClock, Receipt, MessageSquareMore } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  },
  {
    id: 'reservation-assistance',
    icon: CalendarClock,
    title: 'Reservation assistance',
    description: 'Need help with booking, modifying a table reservation? Click here for support.',
  },
  {
    id: 'refunds-cancellations',
    icon: Receipt,
    title: 'Refunds & Cancellations',
    description: 'Need to cancel an order or request a refund? Here\'s how to do it.',
  },
  {
    id: 'other-feedback',
    icon: MessageSquareMore,
    title: 'Other feedback',
    description: 'Let us know how we can serve you better.',
  },
];

export default function HelpCenterPage() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedHelpItem, setSelectedHelpItem] = useState<{ title: string; description: string; } | null>(null);

  const handleItemClick = (item: { title: string; description: string; }) => {
    setSelectedHelpItem(item);
    setIsSheetOpen(true);
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
                    {helpItems.map((item) => (
                        <li key={item.id}>
                           <button onClick={() => handleItemClick(item)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-6">
          {selectedHelpItem && (
            <>
              <SheetHeader className="text-center mb-6">
                <SheetTitle className="text-xl font-bold font-headline">{selectedHelpItem.title}</SheetTitle>
                <SheetDescription>{selectedHelpItem.description}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Enter the subject" className="h-12" defaultValue={selectedHelpItem.title} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Describe your request as detailed as you can.</Label>
                    <Textarea id="description" placeholder="Describe the issue..." rows={5} />
                 </div>
              </div>
              <SheetFooter className="mt-6">
                <Button size="lg" className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsSheetOpen(false)}>
                    Submit Request
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
