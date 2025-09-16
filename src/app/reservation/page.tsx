
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useReservation } from '@/hooks/use-reservation';

const durationOptions = ['1hr', '2hrs', '3hrs', '4hrs', '5hrs', 'All Day'];
const guestOptions = ['2-4 guests', '5-8 guests', '9-15 guests', 'All Day'];
const occasionOptions = ['Birthday', 'Anniversary', 'Business Meeting', 'Casual Dining', 'Other'];
const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

export default function ReservationPage() {
  const router = useRouter();
  const { reservation, updateReservation } = useReservation();

  return (
    <div className="food-pattern min-h-screen pb-32">
      <header className="p-4 flex items-center gap-4">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Table Reservation</h1>
      </header>

      <main className="container mx-auto px-4 space-y-6">
        <p className="text-muted-foreground text-center">
          Please provide your reservation details, including date, time, party size, and any special requests, to help us prepare for your arrival and ensure a seamless experience.
        </p>

        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-2">
            <Label>Select date</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={reservation.day} onValueChange={(value) => updateReservation({ day: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...Array(31)].map((_, i) => <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={reservation.month} onValueChange={(value) => updateReservation({ month: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={reservation.year} onValueChange={(value) => updateReservation({ year: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-2">
            <Label>Select time</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={reservation.hour} onValueChange={(value) => updateReservation({ hour: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => <SelectItem key={i+1} value={`${i+1}`}>{String(i+1).padStart(2, '0')}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={reservation.minute} onValueChange={(value) => updateReservation({ minute: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="00">00</SelectItem>
                   <SelectItem value="15">15</SelectItem>
                   <SelectItem value="30">30</SelectItem>
                   <SelectItem value="45">45</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reservation.period} onValueChange={(value) => updateReservation({ period: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-2">
            <Label>Reservation duration</Label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map(option => (
                <Button 
                  key={option} 
                  variant={reservation.duration === option ? 'destructive' : 'secondary'}
                  onClick={() => updateReservation({ duration: option })}
                  className="rounded-lg"
                >
                  {option}
                </Button>
              ))}
            </div>
            <p className="text-xs text-yellow-600 pt-2">Note: A charge of GHC50 per hour applies to your reservation.</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-2">
            <Label>Number of guests</Label>
             <div className="flex flex-wrap gap-2">
              {guestOptions.map(option => (
                <Button 
                  key={option} 
                  variant={reservation.guests === option ? 'destructive' : 'secondary'}
                  onClick={() => updateReservation({ guests: option })}
                  className="rounded-lg"
                >
                  {option}
                </Button>
              ))}
            </div>
            <p className="text-xs text-yellow-600 pt-2">Note: A charge of GHC500 applies to your selection.</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-2">
             <Label>Occasion</Label>
              <Select value={reservation.occasion} onValueChange={(value) => updateReservation({ occasion: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasionOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-2">
            <Label htmlFor="special-instructions">Special instructions (optional)</Label>
            <Textarea
              id="special-instructions"
              placeholder="add any special requests (e.g., dietary needs, seating preferences, or accessibility requirements)."
              value={reservation.specialInstructions}
              onChange={e => updateReservation({ specialInstructions: e.target.value })}
              maxLength={100}
              rows={4}
            />
            <p className="text-right text-xs text-muted-foreground">{reservation.specialInstructions.length}/100</p>
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Link href="/reservation/details" passHref>
          <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14">
            Reserve Table
          </Button>
        </Link>
      </div>
    </div>
  );
}
