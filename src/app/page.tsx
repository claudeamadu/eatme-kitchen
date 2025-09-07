'use client';

import { Bell, Search, ShoppingCart, Plus, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { recipes, type Recipe } from '@/lib/recipes';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { DailySpecialCard } from '@/components/daily-special-card';
import { PopularDishCard } from '@/components/popular-dish-card';

const dailySpecials = recipes.slice(0, 3);
const popularDishes = recipes.slice(0, 2);

export default function HomePage() {
  return (
    <div className="food-pattern min-h-screen">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-headline font-bold">Good Afternoon! Sylvia</h1>
            <p className="text-muted-foreground">We hope you're in a good mood to dine.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
              <Bell className="h-6 w-6 text-destructive" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 rounded-full bg-destructive text-destructive-foreground">2</Badge>
            </Button>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-bold font-headline container mx-auto px-4 mb-3">Daily Specials</h2>
        <Carousel opts={{ loop: true, align: 'start' }} className="w-full">
          <CarouselContent className="-ml-2">
            {dailySpecials.map((recipe, index) => (
              <CarouselItem key={index} className="pl-4 basis-3/4 md:basis-1/2 lg:basis-1/3">
                <DailySpecialCard recipe={recipe} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="container mx-auto px-4 mb-8">
        <Card className="p-4 flex items-center justify-between gap-4 bg-card shadow-lg rounded-2xl">
          <div className="flex-1">
            <h3 className="font-bold font-headline text-lg">Celebrating a special occasion or event?</h3>
            <Button className="mt-2 rounded-full bg-red-600 hover:bg-red-700 text-white">Reserve your table now!</Button>
          </div>
          <Image src="https://picsum.photos/100/100?random=30" alt="Reservation" width={80} height={80} data-ai-hint="waiter serving food" className="w-20 h-20" />
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
        <div className="space-y-4">
            {popularDishes.map(recipe => (
               <PopularDishCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
      </main>
    </div>
  );
}
