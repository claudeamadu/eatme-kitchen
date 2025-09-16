
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/use-onboarding';


const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
)

export default function AddPaymentMethodPage() {
    const router = useRouter();
    const { user } = useOnboarding();
    const { toast } = useToast();
    
    const [fullName, setFullName] = useState('');
    const [network, setNetwork] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveWallet = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to add a wallet.' });
            return;
        }
        if (!fullName || !network || !phone) {
             toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
            return;
        }
        setIsLoading(true);
        try {
            const walletsCollectionRef = collection(db, 'users', user.uid, 'wallets');
            await addDoc(walletsCollectionRef, {
                name: fullName,
                network: network,
                number: phone,
                logo: `/networks/${network}.png`,
                logoHint: `${network.split(' ')[0].toLowerCase()} logo`,
            });

            toast({ title: 'Wallet Added', description: 'Your new payment method has been saved.' });
            router.back();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="food-pattern min-h-screen pb-24">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
                <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-headline font-bold">Add Wallet</h1>
            </header>

            <main className="container mx-auto px-4">
                <Card className="rounded-2xl shadow-xl overflow-hidden mb-8">
                     <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white relative h-48 flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                            <WalletIcon className="w-8 h-8 opacity-80" />
                             {network && (
                                <Image 
                                    src={`/networks/${network}.png`} 
                                    alt={network} 
                                    width={40} height={40} 
                                    data-ai-hint={`${network} logo`} className="object-contain" 
                                />
                             )}
                         </div>
                         <div>
                            <p className="text-lg font-mono tracking-widest">{phone || '055 123 4567'}</p>
                            <p className="font-semibold uppercase">{fullName || 'Your Name'}</p>
                         </div>
                     </div>
                </Card>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullname" className="pl-1 text-muted-foreground">Full Name</Label>
                        <Input id="fullname" placeholder="Enter your full name" className="h-14 rounded-xl text-base bg-card shadow-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="network" className="pl-1 text-muted-foreground">Mobile Network</Label>
                        <Select onValueChange={setNetwork} value={network}>
                            <SelectTrigger className="h-14 rounded-xl text-base bg-card shadow-sm">
                                <SelectValue placeholder="Select mobile network" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                                <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                                <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="pl-1 text-muted-foreground">Phone Number</Label>
                        <Input id="phone" placeholder="Enter your phone number" type="tel" className="h-14 rounded-xl text-base bg-card shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                </form>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent">
                <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" onClick={handleSaveWallet} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Saving...' : 'Save Wallet'}
                </Button>
            </div>
        </div>
    );
}
