'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Minus, Plus, Trash2, Pencil } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import type { cart_item } from '@/lib/types';

interface CartItemCardProps {
  item: cart_item;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <Card className="p-3 flex items-center gap-4 shadow-md rounded-2xl">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={96}
        height={96}
        className="rounded-xl object-cover w-24 h-24"
        data-ai-hint={item.imageHint}
      />
      <div className="flex-grow">
        <h3 className="font-bold font-headline text-lg">{item.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-1">{item.extras}</p>
        <div className="flex items-center gap-2 mt-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-destructive font-bold text-base mt-1">GHC {item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Button 
            size="icon" 
            className="rounded-t-lg rounded-b-none h-8 w-10 bg-destructive"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg bg-card w-10 text-center">{item.quantity}</span>
        <Button 
            size="icon" 
            className="rounded-b-lg rounded-t-none h-8 w-10 bg-destructive"
            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
        >
          <Minus className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
