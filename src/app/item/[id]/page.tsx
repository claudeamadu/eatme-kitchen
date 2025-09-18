
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Clock, Minus, Plus, Star, Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import type { food_item, review, promo } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const calculateDiscountedPrice = (price: number, promo: promo | null): number => {
    if (!promo || !promo.discountType || promo.discountType === 'none' || !promo.discountValue) {
        return price;
    }
    if (promo.discountType === 'fixed') {
        return Math.max(0, price - promo.discountValue);
    }
    if (promo.discountType === 'percentage') {
        return price * (1 - promo.discountValue / 100);
    }
    return price;
};

function ItemPageComponent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { id } = params;
  const promoId = searchParams.get('promo');
  
  const { addToCart } = useCart();
  const [item, setItem] = useState<food_item | null>(null);
  const [reviews, setReviews] = useState<review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePromo, setActivePromo] = useState<promo | null>(null);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  
  const isCustomizable = !!(item?.sizes?.length || item?.extras?.length);

  useEffect(() => {
    if (promoId) {
        const fetchPromo = async () => {
            const promoRef = doc(db, 'promos', promoId);
            const promoSnap = await getDoc(promoRef);
            if (promoSnap.exists()) {
                setActivePromo({ id: promoSnap.id, ...promoSnap.data() } as promo);
            }
        };
        fetchPromo();
    }
  }, [promoId]);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
        setIsLoading(false);
        notFound();
        return;
    };

    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "foodItems", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && !docSnap.data().isDeleted) {
          const fetchedItem = { id: docSnap.id, ...docSnap.data() } as food_item;
          setItem(fetchedItem);
          if (fetchedItem.sizes && fetchedItem.sizes.length > 0) {
            setSelectedSize(fetchedItem.sizes[0].name);
          }
        } else {
          setItem(null);
        }
      } catch (error) {
        console.error("Error fetching food item:", error);
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItem();

    const reviewsQuery = query(collection(db, 'reviews'), where('foodId', '==', id));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
        const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as review));
        setReviews(fetchedReviews);
    });
    
    return () => unsubscribeReviews();

  }, [id]);

  const { averageRating, totalReviews } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
    };
  }, [reviews]);


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

  const handleExtraToggle = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) 
        ? prev.filter(name => name !== extraName) 
        : [...prev, extraName]
    );
  };

  const calculateTotal = () => {
    if (!item) return 0;

    let totalPerItem = 0;
    
    if (!isCustomizable) {
        totalPerItem = calculateDiscountedPrice(item.price, activePromo);
    } else {
        const basePrice = item.sizes?.find(s => s.name === selectedSize)?.price || item.price || 0;
        const discountedBasePrice = calculateDiscountedPrice(basePrice, activePromo);
        
        const extrasPrice = selectedExtras.reduce((total, extraName) => {
          const extra = item.extras?.find(e => e.name === extraName);
          // Assuming extras are not discounted for simplicity
          return total + (extra?.price || 0);
        }, 0);
        totalPerItem = discountedBasePrice + extrasPrice;
    }
    return totalPerItem * quantity;
  };
  
  const handleAddToCart = () => {
    if (!item) return;
    
    const totalItemPrice = calculateTotal() / quantity;
    let cartItemName = item.title;
    const details: string[] = [];
    
    if (selectedSize) {
        details.push(selectedSize);
    }
    if (selectedExtras.length > 0) {
        details.push(...selectedExtras);
    }

    const extrasString = details.join(', ');
    
    if(isCustomizable && selectedSize) {
       cartItemName = `${item.title} (${selectedSize})`;
    }

    addToCart({
      id: id as string,
      name: cartItemName,
      price: totalItemPrice,
      imageUrl: item.imageUrl,
      imageHint: item.imageHint,
      extras: extrasString,
      quantity: quantity,
    });
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const originalPrice = item.price;
  const discountedPrice = calculateDiscountedPrice(originalPrice, activePromo);
  const hasDiscount = !isCustomizable && discountedPrice < originalPrice;

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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      
      <div className="absolute top-5 left-4 z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-white/80 hover:bg-white backdrop-blur-sm" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
       <div className="absolute top-5 right-4 z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-white/80 hover:bg-white backdrop-blur-sm">
          <Heart className="h-6 w-6 text-destructive" />
        </Button>
      </div>

      <div className="relative pt-[40vh]">
        <div className="bg-background rounded-t-3xl p-6 pb-32">
          <h1 className="text-3xl font-bold font-headline">{item.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground my-3">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-foreground">{averageRating.toFixed(1)}</span>
                <span className="text-sm">({totalReviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">10-20 mins</span>
            </div>
          </div>
          <p className="text-muted-foreground text-base mb-6">{item.description}</p>
          
          {hasDiscount && (
            <div className="flex items-baseline gap-2 mb-6">
              <p className="text-2xl font-bold text-destructive">₵{discountedPrice.toFixed(2)}</p>
              <p className="text-lg font-bold text-muted-foreground line-through">₵{originalPrice.toFixed(2)}</p>
            </div>
          )}

          {!isCustomizable && !hasDiscount && (
            <p className="text-2xl font-bold text-destructive mb-6">₵{item.price.toFixed(2)}</p>
          )}

          {item.sizes && item.sizes.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold font-headline mb-3">Available Sizes</h2>
              <RadioGroup value={selectedSize || ''} onValueChange={setSelectedSize} className="grid grid-cols-3 gap-3">
                {item.sizes.map(size => {
                  const finalPrice = calculateDiscountedPrice(size.price, activePromo);
                  return (
                    <div key={size.name}>
                      <RadioGroupItem value={size.name} id={size.name} className="peer sr-only" />
                      <Label htmlFor={size.name} className={cn(
                        "flex flex-col items-center justify-center rounded-xl p-3 border-2 border-transparent transition-all cursor-pointer",
                        "peer-data-[state=unchecked]:bg-card peer-data-[state=unchecked]:shadow-sm",
                        "peer-data-[state=checked]:bg-destructive peer-data-[state=checked]:text-destructive-foreground"
                      )}>
                        <span className="font-bold">{size.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm">₵{finalPrice.toFixed(2)}</span>
                          {finalPrice < size.price && <span className="text-xs line-through">₵{size.price.toFixed(2)}</span>}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </section>
          )}

          {item.extras && item.extras.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold font-headline mb-3">Extras</h2>
              <div className="grid grid-cols-3 gap-3">
                {item.extras.map(extra => (
                  <div key={extra.name} onClick={() => handleExtraToggle(extra.name)}
                    className={cn("rounded-xl border-2 p-2 text-center cursor-pointer transition-all",
                      selectedExtras.includes(extra.name) ? 'border-destructive bg-destructive/5' : 'border-transparent bg-card shadow-sm'
                    )}
                  >
                    <div className="relative">
                      <Image src={extra.image || `https://picsum.photos/seed/${extra.name}/100/100`} alt={extra.name} width={80} height={80} data-ai-hint={extra.hint || 'food extra'} className="w-full h-20 object-cover rounded-md mb-2"/>
                      <div className={cn("absolute top-1 right-1 h-5 w-5 rounded-full border-2 bg-card flex items-center justify-center",
                          selectedExtras.includes(extra.name) ? 'border-destructive' : 'border-muted-foreground/30'
                      )}>
                          {selectedExtras.includes(extra.name) && <div className="h-2.5 w-2.5 rounded-full bg-destructive" />}
                      </div>
                    </div>
                    <p className="font-semibold text-sm">{extra.name}</p>
                     <p className={cn("font-bold text-xs", selectedExtras.includes(extra.name) ? "text-destructive": "text-muted-foreground")}>+ ₵{extra.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
             <h2 className="text-xl font-bold font-headline mb-4">Reviews ({totalReviews})</h2>
             <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                            <Avatar>
                                <AvatarImage src={review.userPhotoURL} />
                                <AvatarFallback>{getInitials(review.userDisplayName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold">{review.userDisplayName}</h4>
                                    <span className="text-xs text-muted-foreground">{review.createdAt ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("w-4 h-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mt-2">{review.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                )}
             </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4">
        <div className="container mx-auto flex items-center justify-between gap-2 max-w-md bg-card rounded-full p-2 shadow-lg">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 p-1 text-primary">
             <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/20" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                <Minus className="h-5 w-5" />
             </Button>
             <span className="font-bold text-lg w-5 text-center">{quantity}</span>
             <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/20" onClick={() => setQuantity(q => q+1)}>
                <Plus className="h-5 w-5" />
             </Button>
          </div>
          <Button size="lg" className="flex-grow rounded-full" onClick={handleAddToCart}>
            <div className="flex justify-between w-full items-center">
                <span>Add to cart</span>
                <span>₵{calculateTotal().toFixed(2)}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ItemPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen food-pattern"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ItemPageComponent />
        </Suspense>
    )
}
