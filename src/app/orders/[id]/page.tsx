
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, runTransaction, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { order, cart_item } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Loader2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/use-onboarding';

const statusColors: { [key: string]: string } = {
  Ongoing: 'text-orange-500 bg-orange-100',
  Completed: 'text-green-600 bg-green-100',
  Cancelled: 'text-red-600 bg-red-100',
};

const DetailRow = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn("font-semibold", valueClass)}>{value}</span>
  </div>
);

const StarRating = ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                    <Star
                        className={cn(
                            "h-6 w-6 transition-colors",
                            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        )}
                    />
                </button>
            ))}
        </div>
    );
};


export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useOnboarding();
  const { id } = params;
  const { toast } = useToast();

  const [order, setOrder] = useState<order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') {
        setError("Invalid Order ID.");
        setIsLoading(false);
        return;
    };

    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() } as order;
          setOrder(orderData);
          const initialRatings: Record<string, number> = {};
          orderData.items.forEach(item => {
            initialRatings[item.id] = 0;
          });
          setRatings(initialRatings);
        } else {
          setError('Order not found.');
        }
      } catch (err) {
        setError('Failed to fetch order details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);
  
  const handleRatingChange = (itemId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  };

  const submitRatings = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not authenticated' });
        return;
    }
    setIsSubmitting(true);
    try {
        const loyaltyRef = doc(db, 'users', user.uid, 'loyalty', 'data');
        const ratedItemsCount = Object.values(ratings).filter(r => r > 0).length;

        if (ratedItemsCount > 0) {
             await runTransaction(db, async (transaction) => {
                const pointsPerReview = 5;
                const totalPoints = ratedItemsCount * pointsPerReview;
                transaction.set(loyaltyRef, { 
                    points: increment(totalPoints),
                    reviews: increment(ratedItemsCount)
                }, { merge: true });
             });
        }
        
        setIsRatingSheetOpen(false);
        toast({
            title: "Ratings Submitted",
            description: `Thank you for your feedback! You've earned ${ratedItemsCount * 5} points.`,
        });
    } catch(err) {
        console.error("Failed to submit ratings", err);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your ratings.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen food-pattern">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen food-pattern p-4">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  
  if (!order) {
    return null;
  }

  const total = order.total;

  return (
    <div className="food-pattern min-h-screen pb-40">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Order Details</h1>
      </header>

      <main className="container mx-auto px-4 space-y-4">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">Order #: {order.id.slice(0, 6).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">
                  {format(order.createdAt.toDate(), 'eee, dd MMM yyyy')}
                </p>
              </div>
              <Badge className={cn("px-3 py-1 text-sm font-bold rounded-full border-none", statusColors[order.status])}>
                {order.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
                 <p className="text-sm font-bold text-muted-foreground mb-4">Dishes</p>
                 <ul className="space-y-4">
                    {order.items.map((item: cart_item) => (
                        <li key={item.id} className="flex items-center gap-4">
                             <Image
                                src={item.imageUrl}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover w-16 h-16"
                                data-ai-hint={item.imageHint || 'food item'}
                             />
                             <div className="flex-grow">
                                <p className="font-bold">{item.name}</p>
                                <p className="text-destructive font-semibold">GHC {item.price.toFixed(2)}</p>
                             </div>
                             <span className="font-medium text-muted-foreground">x{item.quantity}</span>
                        </li>
                    ))}
                 </ul>
            </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6 divide-y">
                <DetailRow label="Total" value={`GHC ${total.toFixed(2)}`} valueClass="text-xl font-bold text-foreground" />
            </CardContent>
        </Card>

      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent space-y-3">
        <div className="max-w-md mx-auto">
             <Button size="lg" className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14">
                Order Again!
            </Button>
            <Button size="lg" variant="outline" className="w-full rounded-full bg-card/80 backdrop-blur-sm text-lg h-14 mt-3" onClick={() => setIsRatingSheetOpen(true)}>
                Rate Dishes
            </Button>
        </div>
      </div>

       <Sheet open={isRatingSheetOpen} onOpenChange={setIsRatingSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-6">
          <SheetHeader className="text-center mb-4">
            <SheetTitle className="text-xl font-bold font-headline">Rate Your Dishes</SheetTitle>
            <SheetDescription>Let us know how you enjoyed your meal!</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
             {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                     <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover w-16 h-16"
                        data-ai-hint={item.imageHint || 'food item'}
                     />
                     <div className="flex-grow">
                        <p className="font-bold">{item.name}</p>
                        <StarRating rating={ratings[item.id] || 0} setRating={(rating) => handleRatingChange(item.id, rating)} />
                     </div>
                </div>
             ))}
          </div>
          <SheetFooter className="mt-6">
            <Button size="lg" className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={submitRatings} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Ratings'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
