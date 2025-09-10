
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Clock, Minus, Plus, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { food_item } from '@/lib/types';


const sizes = [
  { id: 'small', name: 'Small', price: 50 },
  { id: 'medium', name: 'Medium', price: 90 },
  { id: 'large', name: 'Large', price: 120 },
];

const extras = [
  { id: 'grilled-chicken', name: 'Grilled Chicken', price: 15, image: 'https://picsum.photos/100/100?random=31', hint: 'grilled chicken' },
  { id: 'fried-chicken', name: 'Fried Chicken', price: 10, image: 'https://picsum.photos/100/100?random=32', hint: 'fried chicken' },
  { id: 'tilapia', name: 'Tilapia', price: 10, image: 'https://picsum.photos/100/100?random=33', hint: 'tilapia fish' },
];

// This is the known ID for the special Assorted Jollof item.
const ASSORTED_JOLLOF_ID = 'GhvGkY449paAMH5V02jL';

export default function FoodPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();
  const [item, setItem] = useState<food_item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['tilapia']);
  const [quantity, setQuantity] = useState(1);
  
  const isCustomizable = id === ASSORTED_JOLLOF_ID;

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "foodItems", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && !docSnap.data().isDeleted) {
          setItem({ id: docSnap.id, ...docSnap.data() } as food_item);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching food item:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);

  if (isLoading) {
     return (
      <div className="flex items-center justify-center min-h-screen food-pattern">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return notFound();
  }

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId) 
        : [...prev, extraId]
    );
  };

  const calculateTotal = () => {
    if (!isCustomizable) {
        return item.price * quantity;
    }
    const sizePrice = sizes.find(s => s.id === selectedSize)?.price || 0;
    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = extras.find(e => e.id === extraId);
      return total + (extra?.price || 0);
    }, 0);
    return (sizePrice + extrasPrice) * quantity;
  };
  
  const handleAddToCart = () => {
    if (!item) return;
    
    if (isCustomizable) {
        const sizePrice = sizes.find(s => s.id === selectedSize)?.price || 0;
        const extrasPrice = selectedExtras.reduce((total, extraId) => {
          const extra = extras.find(e => e.id === extraId);
          return total + (extra?.price || 0);
        }, 0);
        const totalItemPrice = sizePrice + extrasPrice;

        const extrasString = selectedExtras.map(id => extras.find(e => e.id === id)?.name).join(', ');

        addToCart({
          id: `${item.id}-${selectedSize}-${selectedExtras.join('-')}`,
          name: `${item.title} (${sizes.find(s => s.id === selectedSize)?.name})`,
          price: totalItemPrice,
          imageUrl: item.imageUrl,
          imageHint: item.imageHint,
          extras: extrasString,
          quantity: quantity,
        });
    } else {
        addToCart({
            id: item.id,
            name: item.title,
            price: item.price,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            quantity: quantity,
        });
    }
  }

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
                <span className="font-bold text-foreground">4.5</span>
                <span className="text-sm">(30 reviews)</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">10-20 mins</span>
            </div>
          </div>
          <p className="text-muted-foreground text-base mb-6">{item.description}</p>
          
          {!isCustomizable && (
            <p className="text-2xl font-bold text-destructive mb-6">GHC {item.price.toFixed(2)}</p>
          )}

          {isCustomizable && (
            <>
              <section className="mb-6">
                <h2 className="text-xl font-bold font-headline mb-3">Available Sizes</h2>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-3 gap-3">
                  {sizes.map(size => (
                    <div key={size.id}>
                      <RadioGroupItem value={size.id} id={size.id} className="peer sr-only" />
                      <Label htmlFor={size.id} className={cn(
                        "flex flex-col items-center justify-center rounded-xl p-3 border-2 border-transparent transition-all",
                        "peer-data-[state=unchecked]:bg-card peer-data-[state=unchecked]:shadow-sm",
                        "peer-data-[state=checked]:bg-destructive peer-data-[state=checked]:text-destructive-foreground"
                      )}>
                        <span className="font-bold">{size.name}</span>
                        <span className="text-sm">GHC {size.price}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </section>

              <section>
                <h2 className="text-xl font-bold font-headline mb-3">Extras</h2>
                <div className="grid grid-cols-3 gap-3">
                  {extras.map(extra => (
                    <div key={extra.id} onClick={() => handleExtraToggle(extra.id)}
                      className={cn("rounded-xl border-2 p-2 text-center cursor-pointer transition-all",
                        selectedExtras.includes(extra.id) ? 'border-destructive bg-destructive/10' : 'border-transparent bg-card shadow-sm'
                      )}
                    >
                      <div className="relative">
                        <Image src={extra.image} alt={extra.name} width={80} height={80} data-ai-hint={extra.hint} className="w-full h-20 object-cover rounded-md mb-2"/>
                        <div className={cn("absolute top-2 right-2 h-5 w-5 rounded-full border-2 bg-card flex items-center justify-center",
                            selectedExtras.includes(extra.id) ? 'border-destructive' : 'border-muted-foreground/30'
                        )}>
                            {selectedExtras.includes(extra.id) && <div className="h-2.5 w-2.5 rounded-full bg-destructive" />}
                        </div>
                      </div>
                      <p className="font-semibold text-sm">{extra.name}</p>
                       <p className={cn("font-bold text-xs", selectedExtras.includes(extra.id) ? "text-destructive": "text-muted-foreground")}>GHC {extra.price}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
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
          <Button size="lg" className="flex-grow rounded-full bg-destructive/90 backdrop-blur-sm text-destructive-foreground hover:bg-destructive" onClick={handleAddToCart}>
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
