
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, runTransaction, increment } from 'firebase/firestore';
import type { reservation, reservation_status } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as reservation));
      setReservations(allReservations);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleStatusChange = async (reservation: reservation, newStatus: reservation_status) => {
    const reservationRef = doc(db, 'reservations', reservation.id);
    await updateDoc(reservationRef, { status: newStatus });

    if (newStatus === 'Confirmed' && reservation.occasion === 'Birthday') {
        const loyaltyRef = doc(db, 'users', reservation.uid, 'loyalty', 'data');
        try {
            await runTransaction(db, async (transaction) => {
                transaction.set(loyaltyRef, { points: increment(50) }, { merge: true });
            });
            toast({
                title: 'Birthday Bash Bonus!',
                description: `User ${reservation.uid.slice(0,6)} earned 50 points for a birthday reservation.`
            });
        } catch (error) {
            console.error("Failed to apply birthday bonus:", error);
            toast({
                variant: 'destructive',
                title: 'Bonus Failed',
                description: 'Could not apply Birthday Bash bonus.'
            });
        }
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
        <h2 className="text-3xl font-bold">Reservations</h2>
        <p className="text-muted-foreground">Manage all table reservations.</p>
      </header>
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>All Reservations</CardTitle>
                <Link href="/admin/reservations/settings">
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Occasion</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.date} at {r.time}</TableCell>
                  <TableCell>{r.guests}</TableCell>
                  <TableCell>{r.occasion}</TableCell>
                  <TableCell>₵{r.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(value) => handleStatusChange(r, value as reservation_status)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
