
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { reservation_config } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const guestOptions = ['2-4 guests', '5-8 guests', '9-15 guests', 'All Day'];

export default function ReservationSettingsPage() {
    const [config, setConfig] = useState<reservation_config>({ ratePerHour: 0, guestRates: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchConfig = async () => {
            const configRef = doc(db, 'config', 'reservation');
            const docSnap = await getDoc(configRef);
            if (docSnap.exists()) {
                setConfig(docSnap.data() as reservation_config);
            } else {
                // Initialize with default structure if it doesn't exist
                const defaultConfig: reservation_config = {
                    ratePerHour: 50,
                    guestRates: {
                        '2-4 guests': 500,
                        '5-8 guests': 500,
                        '9-15 guests': 500,
                        'All Day': 500,
                    }
                };
                setConfig(defaultConfig);
            }
            setIsLoading(false);
        };
        fetchConfig();
    }, []);

    const handleRateChange = (field: keyof reservation_config, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };
    
    const handleGuestRateChange = (guestTier: string, value: string) => {
        const price = parseFloat(value) || 0;
        setConfig(prev => ({
            ...prev,
            guestRates: {
                ...prev.guestRates,
                [guestTier]: price
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const configRef = doc(db, 'config', 'reservation');
            await setDoc(configRef, config);
            toast({ title: 'Success', description: 'Reservation settings have been updated.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold">Reservation Settings</h2>
                <p className="text-muted-foreground">Configure the pricing for table reservations.</p>
            </header>

            <div className="space-y-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Duration Rate</CardTitle>
                        <CardDescription>Set the cost per hour for reservations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="ratePerHour">Rate per Hour (GHC)</Label>
                            <Input
                                id="ratePerHour"
                                type="number"
                                value={config.ratePerHour}
                                onChange={(e) => handleRateChange('ratePerHour', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Guest-based Rates</CardTitle>
                        <CardDescription>Set the flat-rate cost for different party sizes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {guestOptions.map(option => (
                            <div key={option} className="space-y-2">
                                <Label htmlFor={`rate-${option.replace(/\s+/g, '-')}`}>Rate for "{option}" (GHC)</Label>
                                <Input
                                    id={`rate-${option.replace(/\s+/g, '-')}`}
                                    type="number"
                                    value={config.guestRates[option] || ''}
                                    onChange={(e) => handleGuestRateChange(option, e.target.value)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </>
    );
}
