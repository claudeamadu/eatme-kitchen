
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReservation } from '@/hooks/use-reservation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import Image from 'next/image';

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between py-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-right">{value}</span>
    </div>
);

const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

export default function ReservationSummaryPage() {
    const router = useRouter();
    const { user } = useOnboarding();
    const { toast } = useToast();
    const { reservation, getReservationTotal, clearReservation } = useReservation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const bookingDate = `${reservation.day} ${months.find(m => m.value === reservation.month)?.label || ''}, ${reservation.year}`;
    const bookingTime = `${reservation.hour}:${reservation.minute} ${reservation.period}`;

    const { durationCost, guestsCost, total } = getReservationTotal();

    const handleConfirmReservation = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated', description: 'Please log in to make a reservation.' });
            return;
        }

        setIsProcessing(true);
        try {
            await addDoc(collection(db, 'reservations'), {
                uid: user.uid,
                name: reservation.name,
                phone: reservation.phone,
                date: bookingDate,
                time: bookingTime,
                guests: reservation.guests,
                duration: reservation.duration,
                occasion: reservation.occasion,
                specialInstructions: reservation.specialInstructions,
                total: total,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });

            setIsModalOpen(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Reservation Failed', description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleFinish = () => {
        clearReservation();
        setIsModalOpen(false);
        router.push('/');
    };

    return (
        <div className="food-pattern min-h-screen pb-32">
            <header className="p-4 flex items-center gap-4">
                <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-headline font-bold">Review Summary</h1>
            </header>

            <main className="container mx-auto px-4 space-y-6">
                <Card className="rounded-2xl shadow-lg">
                    <CardContent className="p-6 divide-y">
                        <DetailRow label="Booking for" value={bookingDate} />
                        <DetailRow label="Time" value={bookingTime} />
                        <DetailRow label="Reservation duration" value={reservation.duration} />
                        <DetailRow label="Number of guests" value={reservation.guests} />
                        <DetailRow label="Occasion" value={reservation.occasion} />
                        <DetailRow label="Name" value={reservation.name} />
                        <DetailRow label="Phone Number" value={reservation.phone} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg">
                     <CardContent className="p-6">
                        <div className="space-y-3">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">GHC {durationCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Number of guests</span>
                                <span className="font-medium">GHC {guestsCost.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="border-t my-4"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold">TOTAL</span>
                            <span className="font-bold text-xl">GHC {total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-yellow-600">
                    Please note: your reservation is confirmed upon payment.
                </p>
            </main>
            
            <div className="fixed bottom-0 left-0 right-0 p-4">
                 <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" onClick={handleConfirmReservation} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? 'Confirming...' : 'Confirm Reservation'}
                </Button>
            </div>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent className="max-w-xs rounded-2xl">
                     <AlertDialogHeader className="items-center text-center">
                        <Image src="https://picsum.photos/seed/reservation/300/200" width={150} height={100} alt="Reservation Confirmed" data-ai-hint="reservation confirmation celebration" />
                        <AlertDialogTitle className="text-2xl font-bold font-headline">Reservation Confirmed</AlertDialogTitle>
                        <AlertDialogDescription>
                           Your table has been booked. We're excited to have you! You can view your reservation details on the homepage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full rounded-full bg-red-600 hover:bg-red-700" onClick={handleFinish}>Done</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
