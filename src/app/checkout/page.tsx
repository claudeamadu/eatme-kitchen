
'use client';

import { Suspense, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, PlusCircle, Receipt, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction, increment } from 'firebase/firestore';
import { useReservation } from '@/hooks/use-reservation';

const MopedIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 18h1" />
        <path d="M13 6h5l-3.5 5.5" />
        <path d="M18 16.5V9l-3-3" />
        <path d="M3 16v-5h3" />
        <path d="m3 11 2 3h3" />
        <path d="M13 9h-1.5" />
    </svg>
)

const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

function CheckoutComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutType = searchParams.get('type') || 'food';

    const cart = useCart();
    const reservationHook = useReservation();
    const { user } = useOnboarding();
    const { toast } = useToast();
    
    const [paymentMethod, setPaymentMethod] = useState('mobile-money');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isFood = checkoutType === 'food';
    
    const { total, items } = isFood 
        ? { total: cart.total, items: cart.items } 
        : { total: reservationHook.getReservationTotal().total, items: [] };
    
    const fee = 0.0;
    const eLevy = 0.0;
    const finalTotal = total + fee + eLevy;

    const handleConfirmOrder = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated', description: 'Please log in to proceed.' });
            return;
        }
        
        setIsProcessing(true);
        try {
            if (isFood) {
                if (items.length === 0) {
                    toast({ variant: 'destructive', title: 'Empty Cart', description: 'Your cart is empty.' });
                    return;
                }
                await runTransaction(db, async (transaction) => {
                    const loyaltyRef = doc(db, 'users', user.uid, 'loyalty', 'data');
                    const orderData = {
                        uid: user.uid,
                        items: cart.items.map(item => ({
                            id: item.id, name: item.name, quantity: item.quantity, price: item.price,
                            imageUrl: item.imageUrl, imageHint: item.imageHint, extras: item.extras,
                        })),
                        total: finalTotal, status: 'Ongoing', createdAt: serverTimestamp(),
                    };
                    transaction.set(doc(collection(db, 'orders')), orderData);
                    const pointsEarned = Math.floor(finalTotal / 10);
                    transaction.set(loyaltyRef, { 
                        points: increment(pointsEarned - cart.appliedPoints),
                        orders: increment(1) 
                    }, { merge: true });
                });
            } else {
                 const { reservation } = reservationHook;
                 const bookingDate = `${reservation.day} ${months.find(m => m.value === reservation.month)?.label || ''}, ${reservation.year}`;
                 const bookingTime = `${reservation.hour}:${reservation.minute} ${reservation.period}`;

                 await addDoc(collection(db, 'reservations'), {
                    uid: user.uid,
                    name: reservation.name, phone: reservation.phone, date: bookingDate, time: bookingTime,
                    guests: reservation.guests, duration: reservation.duration, occasion: reservation.occasion,
                    specialInstructions: reservation.specialInstructions, total: finalTotal, status: 'Pending',
                    createdAt: serverTimestamp(),
                });
            }
            setIsModalOpen(true);
        } catch (error: any) {
            console.error("Error creating order/reservation:", error);
            toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleModalAction = () => {
        if (isFood) {
            cart.clearCart();
            router.push('/orders');
        } else {
            reservationHook.clearReservation();
            router.push('/');
        }
    }
    
    const getModalTitle = () => isFood ? 'Order Confirmed' : 'Reservation Confirmed';
    const getModalDescription = () => isFood 
        ? "Your order is confirmed! You'll receive updates as it progresses. Track the status anytime on the Orders page."
        : "Your table has been booked. We're excited to have you! You can view your reservation details on the homepage.";
    const getModalActionText = () => isFood ? 'Track Order' : 'Done';
    const getModalImage = () => isFood ? 'https://picsum.photos/300/200' : 'https://picsum.photos/seed/reservation/300/200';
    const getModalImageHint = () => isFood ? 'order confirmation' : 'reservation confirmation celebration';


    return (
        <div className="min-h-screen food-pattern pb-32">
            <header className="p-4 flex items-center gap-4 sticky top-0 z-10">
                <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-headline font-bold">Payment</h1>
            </header>

            <main className="px-4 space-y-6">
                <Card className="rounded-2xl shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-end mb-4">
                            {isFood ? <MopedIcon className="w-8 h-8 text-destructive" /> : <Receipt className="w-8 h-8 text-destructive" />}
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-medium">GHC {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fee</span>
                                <span className="font-medium">GHC {fee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">E - Levy</span>
                                <span className="font-medium">GHC {eLevy.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="border-t my-4"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">You will be charged</span>
                            <span className="font-bold text-xl">GHC {finalTotal.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-base font-bold text-muted-foreground">Pay with</h2>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className={cn("rounded-2xl border-2 transition-all", paymentMethod === 'mobile-money' ? 'border-destructive bg-destructive/5' : 'border-transparent bg-card')}>
                            <div className="flex items-center p-4">
                                <RadioGroupItem value="mobile-money" id="mobile-money" />
                                <Label htmlFor="mobile-money" className="flex-grow ml-4 font-bold text-base">Mobile Money</Label>
                                <div className="flex items-center gap-2">
                                     <Image src="/networks/mtn.png" alt="MTN Mobile Money" width={24} height={24} data-ai-hint="MTN logo" className="object-contain" />
                                     <Image src="/networks/vodafone.png" alt="Vodafone Cash" width={24} height={24} data-ai-hint="vodafone logo" className="object-contain" />
                                     <Image src="/networks/airteltigo.png" alt="AirtelTigo Money" width={24} height={24} data-ai-hint="airteltigo logo" className="object-contain" />
                                </div>
                            </div>
                            {paymentMethod === 'mobile-money' && (
                                <div className="p-4 pt-0">
                                    <Card className="p-4 shadow-sm">
                                        <div className="flex items-center">
                                            <div className="flex-grow">
                                                <p className="font-bold">0551245566</p>
                                                <p className="text-sm text-muted-foreground">MTN Mobile Money</p>
                                            </div>
                                        </div>
                                    </Card>
                                     <button className="flex items-center gap-2 mt-4 text-destructive font-semibold">
                                        <PlusCircle className="w-5 h-5" />
                                        <span>Add a new wallet</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <Card className={cn("rounded-2xl border-2 transition-all", paymentMethod === 'cash' ? 'border-destructive bg-destructive/5' : 'border-transparent')}>
                             <div className="flex items-center p-4">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex-grow ml-4 font-bold text-base">Cash</Label>
                                <Receipt className="w-6 h-6 text-muted-foreground" />
                            </div>
                        </Card>
                    </RadioGroup>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4">
                <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" onClick={handleConfirmOrder} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? 'Processing...' : `Confirm ${isFood ? 'Order' : 'Reservation'}`}
                </Button>
            </div>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent className="max-w-xs rounded-2xl">
                     <AlertDialogHeader className="items-center text-center">
                        <Image src={getModalImage()} width={150} height={100} alt={getModalTitle()} data-ai-hint={getModalImageHint()} />
                        <AlertDialogTitle className="text-2xl font-bold font-headline">{getModalTitle()}</AlertDialogTitle>
                        <AlertDialogDescription>
                           {getModalDescription()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full rounded-full bg-red-600 hover:bg-red-700" onClick={handleModalAction}>{getModalActionText()}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <CheckoutComponent />
        </Suspense>
    )
}
