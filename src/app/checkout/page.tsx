
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, PlusCircle, Radio, Receipt, Wallet, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';


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

export default function CheckoutPage() {
    const router = useRouter();
    const { subtotal, total, loyaltyPoints, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('mobile-money');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fee = 0.0;
    const eLevy = 0.0;
    const finalTotal = total + fee + eLevy;

    const handleConfirmOrder = () => {
        setIsModalOpen(true);
    };

    const handleTrackOrder = () => {
        clearCart();
        router.push('/orders');
    }

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
                            <MopedIcon className="w-8 h-8 text-destructive" />
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
                                     <Image src="https://picsum.photos/100/100?random=40" alt="MTN Mobile Money" width={24} height={24} data-ai-hint="MTN logo" className="object-contain" />
                                     <Image src="https://picsum.photos/100/100?random=41" alt="Vodafone Cash" width={24} height={24} data-ai-hint="vodafone logo" className="object-contain" />
                                     <Image src="https://picsum.photos/100/100?random=42" alt="AirtelTigo Money" width={24} height={24} data-ai-hint="airteltigo logo" className="object-contain" />
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
                <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" onClick={handleConfirmOrder}>
                    Confirm Order
                </Button>
            </div>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent className="max-w-xs rounded-2xl">
                     <AlertDialogHeader className="items-center text-center">
                        <Image src="https://picsum.photos/300/200" width={150} height={100} alt="Order Confirmed" data-ai-hint="order confirmation" />
                        <AlertDialogTitle className="text-2xl font-bold font-headline">Order Confirmed</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your order is confirmed! You'll receive updates as it progresses. Track the status anytime on the Orders page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full rounded-full bg-red-600 hover:bg-red-700" onClick={handleTrackOrder}>Track Order</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
