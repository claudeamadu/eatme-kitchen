'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">My Favorites</h1>
      <div className="text-center py-20 bg-card rounded-lg flex flex-col items-center">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">No Favorites Yet</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
            You haven't saved any favorite food items. Start exploring and add some!
          </p>
          <Link href="/menu" passHref>
            <Button size="lg">Discover Food</Button>
          </Link>
        </div>
    </div>
  );
}
