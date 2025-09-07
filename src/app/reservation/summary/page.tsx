
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between py-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-right">{value}</span>
    </div>
);

export default function ReservationSummaryPage() {
    const router = useRouter();

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
                        <DetailRow label="Booking for" value="24 October, 2024" />
                        <DetailRow label="Time" value="10:00 AM" />
                        <DetailRow label="Reservation duration" value="3hrs" />
                        <DetailRow label="Number of guests" value="9-15 guests" />
                        <DetailRow label="Occasion" value="Birthday" />
                        <DetailRow label="Name" value="James Quansah" />
                        <DetailRow label="Email" value="jamesquansah@gmail.com" />
                        <DetailRow label="Phone Number" value="0551234569" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg">
                     <CardContent className="p-6">
                        <div className="space-y-3">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">GHC 50.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Number of guests</span>
                                <span className="font-medium">GHC 500.00</span>
                            </div>
                        </div>
                        <div className="border-t my-4"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold">TOTAL</span>
                            <span className="font-bold text-xl">GHC 550.00</span>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-yellow-600">
                    Please note: your reservation is confirmed upon payment.
                </p>
            </main>
            
            <div className="fixed bottom-0 left-0 right-0 p-4">
                <Link href="/checkout" passHref>
                     <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14">
                        Proceed to Payment
                    </Button>
                </Link>
            </div>
        </div>
    );
}
