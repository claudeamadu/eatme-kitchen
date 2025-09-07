
'use client';

import { useState } from 'react';
import { foodItems } from '@/lib/food';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Minus, Plus, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


export default function FoodPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const item = foodItems.find(r => r.slug === params.slug);
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    notFound();
  }
  
  if (item.slug === 'assorted-jollof') {
    notFound();
  }

  const price = item.price;
  const calculateTotal = () => (price * quantity);


  return (
    <div className="relative min-h-screen food-pattern">
       <div className="absolute top-0 left-0 right-0 h-[45vh]">
        <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            data-ai-hint={item.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

       <div className="absolute top-5 left-4 z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-white/80 hover:bg-white backdrop-blur-sm" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative pt-[40vh]">
        <div className="bg-background rounded-t-3xl p-6 pb-32">
          <h1 className="text-3xl font-bold font-headline">{item.title}</h1>
           <div className="flex items-center gap-4 text-muted-foreground my-3">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-foreground">4.8</span>
                <span className="text-sm">(50+ reviews)</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">15-25 mins</span>
            </div>
          </div>
          <p className="text-muted-foreground text-base my-4">{item.description}</p>
          
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{item.cuisine}</Badge>
                {item.dietary.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4">
        <div className="container mx-auto flex items-center justify-between gap-2 max-w-md">
          <div className="flex items-center gap-2 rounded-full bg-destructive/90 p-1 text-destructive-foreground backdrop-blur-sm">
             <Button size="icon" variant="ghost" className="rounded-full hover:bg-destructive-foreground/20" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                <Minus className="h-5 w-5" />
             </Button>
             <span className="font-bold text-lg w-5 text-center">{quantity}</span>
             <Button size="icon" variant="ghost" className="rounded-full hover:bg-destructive-foreground/20" onClick={() => setQuantity(q => q+1)}>
                <Plus className="h-5 w-5" />
             </Button>
          </div>
          <Button size="lg" className="flex-grow rounded-full bg-destructive/90 backdrop-blur-sm text-destructive-foreground hover:bg-destructive">
            <div className="flex justify-between w-full items-center">
                <span>Add to cart</span>
                <span>GHC {calculateTotal().toFixed(2)}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
