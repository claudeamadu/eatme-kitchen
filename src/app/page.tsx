
'use client';

import { useState, useEffect } from 'react';
import { Bell, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';
import type { food_item, promo } from '@/lib/types';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { PromoCard } from '@/components/promo-card';
import { PopularDishCard } from '@/components/popular-dish-card';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function HomePage() {
  const { user } = useOnboarding();
  const displayName = user?.displayName?.split(' ')[0] || 'there';
  const [popularDishes, setPopularDishes] = useState<food_item[]>([]);
  const [promos, setPromos] = useState<promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good Afternoon!');

  useEffect(() => {
    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        return 'Good Morning!';
      } else if (currentHour < 18) {
        return 'Good Afternoon!';
      } else {
        return 'Good Evening!';
      }
    };
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const popularQuery = query(
      collection(db, 'foodItems'), 
      where('isDeleted', '!=', true),
      limit(4)
    );

    const promosQuery = query(collection(db, 'promos'));

    const unsubPopular = onSnapshot(popularQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as food_item));
        setPopularDishes(items);
        if (isLoading) setIsLoading(false);
    });

    const unsubPromos = onSnapshot(promosQuery, (snapshot) => {
        const promoItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as promo));
        setPromos(promoItems);
        if (isLoading) setIsLoading(false);
    });

    return () => {
        unsubPopular();
        unsubPromos();
    };
  }, [isLoading]);

  return (
    <div className="food-pattern min-h-screen">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-headline font-bold">{greeting}</h1>
            <p className="text-muted-foreground">We hope you're in a good mood to dine.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                <Bell className="h-6 w-6 text-destructive" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 rounded-full bg-destructive text-destructive-foreground">2</Badge>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mb-8">
         <Carousel opts={{ loop: true, align: 'start' }} className="w-full">
           <CarouselContent className="-ml-4">
             {promos.map((promo, index) => (
              <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-2/3">
                <PromoCard {...promo} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
      
      <section className="container mx-auto px-4 mb-8">
        <Card className="p-4 flex items-center justify-between gap-4 bg-card shadow-lg rounded-2xl">
          <div className="flex-1">
            <h3 className="font-bold font-headline text-lg">Celebrating a special occasion or event?</h3>
            <Link href="/reservation" passHref>
              <Button className="mt-2 rounded-full bg-red-600 hover:bg-red-700 text-white">Reserve your table now!</Button>
            </Link>
          </div>
          <Image src="/assets/d136b40050182efd17664f91a0bcd355.png" alt="Reservation" width={80} height={80} data-ai-hint="waiter serving food" className="w-20 h-20" />
        </Card>
      </section>
      
      <main className="container mx-auto px-4 pb-24">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-headline">Popular Dishes</h2>
            <Link href="/menu">
                <Button variant="link" className="text-destructive">
                    View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : popularDishes.length > 0 ? (
          <div className="space-y-4">
            {popularDishes.map(item => (
               <PopularDishCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No popular dishes available right now.</p>
        )}
      </main>
    </div>
  );
}
