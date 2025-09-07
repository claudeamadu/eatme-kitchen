'use client';

import { useFavorites } from '@/hooks/use-favorites';
import { recipes, type Recipe } from '@/lib/recipes';
import { RecipeCard } from '@/components/recipe-card';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();

  const favoriteRecipes = recipes.filter((recipe) => favorites.includes(recipe.id));

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-headline font-bold mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-lg shadow-sm animate-pulse h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">My Favorites</h1>
      {favoriteRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-lg flex flex-col items-center">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">No Favorites Yet</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
            You haven't saved any favorite recipes. Start exploring and add some!
          </p>
          <Link href="/" passHref>
            <Button size="lg">Discover Recipes</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
