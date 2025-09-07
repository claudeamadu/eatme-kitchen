
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartItemCard } from '@/components/cart-item-card';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, total, loyaltyPoints } = useCart();
  const [loyaltyInput, setLoyaltyInput] = useState('');

  const handleApplyLoyalty = () => {
    // In a real app, you'd validate and apply points
    console.log('Applying loyalty points:', loyaltyInput);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 food-pattern">
        <div className="text-center">
            <div className="flex justify-center mb-6">
                 <div className="p-5 bg-card rounded-full shadow-lg">
                    <ShoppingCartIcon className="w-16 h-16 text-primary" />
                 </div>
            </div>
          <h1 className="text-3xl font-bold font-headline mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/menu" passHref>
            <Button size="lg" className="rounded-full">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen food-pattern pb-64">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Cart</h1>
      </header>

      <main className="px-4">
        <div className="space-y-4">
          {items.map(item => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4">
        <Card className="max-w-md mx-auto p-4 rounded-2xl shadow-xl bg-card/95 backdrop-blur-sm">
           <div className="flex justify-between items-center gap-2 mb-4">
            <Input 
                placeholder="Loyalty Points" 
                className="bg-background rounded-full"
                value={loyaltyInput}
                onChange={(e) => setLoyaltyInput(e.target.value)}
            />
            <Button className="rounded-full" onClick={handleApplyLoyalty}>APPLY</Button>
          </div>
          
          <div className="space-y-2 text-base font-medium">
            <div className="flex justify-between text-muted-foreground">
              <span>Cart Total</span>
              <span>GHC {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Loyalty Points</span>
              <span className="text-destructive">- GHC {loyaltyPoints.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border my-2"></div>
            <div className="flex justify-between font-bold text-lg text-foreground">
              <span>Total</span>
              <span>GHC {total.toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout" passHref className="block mt-4">
            <Button size="lg" className="w-full rounded-full">
              Proceed to Checkout
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
