
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReservation } from '@/hooks/use-reservation';

export default function ReservationDetailsPage() {
    const router = useRouter();
    const { reservation, updateReservation, isDetailsFilled } = useReservation();

    return (
        <div className="food-pattern min-h-screen pb-32">
            <header className="p-4 flex items-center gap-4">
                <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-headline font-bold">Reservation Details</h1>
            </header>

            <main className="container mx-auto px-4 space-y-6">
                <form className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="name" className="pl-1 text-muted-foreground">Name</Label>
                        <Input 
                            id="name" 
                            placeholder="Enter your name" 
                            className="h-14 rounded-xl text-base bg-card shadow-sm" 
                            value={reservation.name}
                            onChange={(e) => updateReservation({ name: e.target.value })}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone" className="pl-1 text-muted-foreground">Phone Number</Label>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" className="h-14 rounded-xl bg-card shadow-sm px-3">
                                <span className="text-2xl">🇬🇭</span>
                                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                            </Button>
                            <div className="relative flex-grow">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">+233</span>
                                <Input 
                                    id="phone" 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    className="h-14 rounded-xl text-base bg-card shadow-sm pl-14" 
                                    value={reservation.phone}
                                    onChange={(e) => updateReservation({ phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </main>

             <div className="fixed bottom-0 left-0 right-0 p-4">
                <Link href="/reservation/summary" passHref className={!isDetailsFilled ? 'pointer-events-none' : ''}>
                    <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" disabled={!isDetailsFilled}>
                        Continue
                    </Button>
                </Link>
            </div>
        </div>
    );
}
