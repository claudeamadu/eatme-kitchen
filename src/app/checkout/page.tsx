
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Receipt, Loader2, Wallet, PlusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction, increment, onSnapshot, query } from 'firebase/firestore';
import { useReservation } from '@/hooks/use-reservation';
import { chargeWithPaystack, verifyPaystackTransaction } from '@/lib/paystack';
import type { wallet as WalletType } from '@/lib/types';
import Link from 'next/link';
import { sms } from '@/lib/sms';

const MopedIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('Processing...');
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

    const isFood = checkoutType === 'food';

    const { total, items } = isFood
        ? { total: cart.total, items: cart.items }
        : { total: reservationHook.getReservationTotal().total, items: [] };

    const fee = 0.0;
    const eLevy = 0.0;
    const finalTotal = total + fee + eLevy;

    useEffect(() => {
        if (user) {
            const walletsQuery = query(collection(db, 'users', user.uid, 'wallets'));
            const unsubscribe = onSnapshot(walletsQuery, (querySnapshot) => {
                const userWallets: WalletType[] = [];
                querySnapshot.forEach((doc) => {
                    userWallets.push({ id: doc.id, ...doc.data() } as WalletType);
                });
                setWallets(userWallets);
                if (userWallets.length > 0 && !selectedWalletId) {
                    setSelectedWalletId(userWallets[0].id);
                }
            });

            return () => unsubscribe();
        }
    }, [user, selectedWalletId]);

    const handleSuccessfulPayment = async () => {
        if (!user) return;

        try {
            if (isFood) {
                if (items.length === 0) {
                    toast({ variant: 'destructive', title: 'Empty Cart', description: 'Your cart is empty.' });
                    return;
                }
                await runTransaction(db, async (transaction) => {
                    const orderRef = doc(collection(db, 'orders'));
                    const loyaltyRef = doc(db, 'users', user.uid, 'loyalty', 'data');
                    const orderData = {
                        uid: user.uid,
                        items: cart.items.map(item => ({
                            id: item.id, name: item.name, quantity: item.quantity, price: item.price,
                            imageUrl: item.imageUrl, imageHint: item.imageHint, extras: item.extras,
                        })),
                        total: finalTotal, status: 'Pending', createdAt: serverTimestamp(),
                    };
                    transaction.set(orderRef, orderData);

                    const timelineRef = collection(orderRef, 'timelines');
                    transaction.set(doc(timelineRef), {
                        status: 'Pending',
                        timestamp: serverTimestamp()
                    });

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
        }
    }

    const pollTransactionStatus = (reference: string, retries = 20) => {
        const interval = setInterval(async () => {
            if (retries <= 0) {
                clearInterval(interval);
                toast({ variant: 'destructive', title: 'Payment Timed Out', description: 'Please try again.' });
                setIsProcessing(false);
                return;
            }

            const result = await verifyPaystackTransaction(reference);

            if (result.status === 'success') {
                clearInterval(interval);
                setProcessingMessage('Payment successful! Finishing up...');
                sms.send(sms.ADMIN_PHONE,'Payment recieved! Check Dashboard for more details')
                await handleSuccessfulPayment();
                setIsProcessing(false);
            } else if (result.status === 'failed') {
                clearInterval(interval);
                toast({ variant: 'destructive', title: 'Payment Failed', description: 'Your payment could not be completed.' });
                setIsProcessing(false);
            }
            // If pending, do nothing and let the polling continue.
            retries--;

        }, 5000); // Poll every 5 seconds
    };

    const handlePay = async () => {
        if (!user?.email) {
            toast({ variant: 'destructive', title: 'Error', description: 'User email not found.' });
            return;
        }
        if (!selectedWalletId) {
            toast({ variant: 'destructive', title: 'No Wallet Selected', description: 'Please select a payment method.' });
            return;
        }

        const selectedWallet = wallets.find(w => w.id === selectedWalletId);
        if (!selectedWallet) {
            toast({ variant: 'destructive', title: 'Error', description: 'Selected wallet not found.' });
            return;
        }

        setIsProcessing(true);
        setProcessingMessage('Initiating payment...');

        try {
            const networkMap = {
                'mtn': 'mtn',
                'vodafone': 'vod',
                'airteltigo': 'atl'
            } as const;

            const provider = networkMap[selectedWallet.network as keyof typeof networkMap];

            if (!provider) {
                toast({ variant: 'destructive', title: 'Unsupported Network', description: 'This mobile money provider is not supported.' });
                setIsProcessing(false);
                return;
            }

            const chargeResponse = await chargeWithPaystack({
                email: user.email,
                amount: finalTotal,
                mobile_money: {
                    phone: selectedWallet.number,
                    provider: provider
                }
            });
            //console.log(chargeResponse)
            if (chargeResponse.status && chargeResponse.reference) {
                setProcessingMessage(chargeResponse.message || 'Awaiting confirmation on your phone...');
                // Start polling for verification
                pollTransactionStatus(chargeResponse.reference);
            } else {
                toast({ variant: 'destructive', title: 'Payment Error', description: chargeResponse.message });
                setIsProcessing(false);
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Payment Error', description: error.message });
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
    const getModalImage = () => '/assets/Confirmed-pana.png';
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
                                <span className="font-medium">₵{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fee</span>
                                <span className="font-medium">₵{fee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">E - Levy</span>
                                <span className="font-medium">₵{eLevy.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="border-t my-4"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">You will be charged</span>
                            <span className="font-bold text-xl">₵{finalTotal.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg">
                    <CardContent className="p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-muted-foreground" /> Mobile Money</h3>
                        <div className="space-y-3">
                            {wallets.map(wallet => (
                                <div key={wallet.id} className="flex items-center gap-4 p-3 rounded-lg border bg-background" onClick={() => setSelectedWalletId(wallet.id)}>
                                    <input type="radio" name="wallet" value={wallet.id} checked={selectedWalletId === wallet.id} readOnly className="h-5 w-5 text-destructive border-muted-foreground focus:ring-destructive" />
                                    <Image src={wallet.logo} alt={wallet.network} width={40} height={40} data-ai-hint={wallet.logoHint} className="w-10 h-10 object-contain" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{wallet.name}</p>
                                        <p className="text-sm text-muted-foreground">{wallet.number}</p>
                                    </div>
                                </div>
                            ))}
                            <Link href="/settings/payment-methods/add" passHref>
                                <button className="mt-2 w-full flex items-center justify-center gap-2 p-3 text-center text-primary font-semibold border-2 border-dashed border-primary/50 rounded-lg hover:bg-primary/5 transition-colors">
                                    <PlusCircle className="w-5 h-5" />
                                    <span>Add new wallet</span>
                                </button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4">
                <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" onClick={handlePay} disabled={isProcessing || finalTotal <= 0}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? processingMessage : `Pay & Confirm ${isFood ? 'Order' : 'Reservation'}`}
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
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CheckoutComponent />
        </Suspense>
    )
}
