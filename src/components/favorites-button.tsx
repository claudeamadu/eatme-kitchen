'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FavoritesButtonProps {
  recipeId: string;
  recipeTitle: string;
}

export function FavoritesButton({ recipeId, recipeTitle }: FavoritesButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const [isFav, setIsFav] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded) {
      setIsFav(isFavorite(recipeId));
    }
  }, [isLoaded, isFavorite, recipeId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if the button is inside an anchor
    e.stopPropagation();
    
    toggleFavorite(recipeId);
    const newFavStatus = !isFav;
    setIsFav(newFavStatus);

    toast({
      title: newFavStatus ? 'Added to Favorites!' : 'Removed from Favorites',
      description: newFavStatus ? `${recipeTitle} is now in your favorites.` : `${recipeTitle} has been removed.`,
      duration: 3000,
    });
  };
  
  if (!isLoaded) {
    return  <Button variant="ghost" size="icon" className="rounded-full bg-white/70 backdrop-blur-sm" disabled>
        <Heart className="h-5 w-5 text-muted-foreground" />
      </Button>
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
      onClick={handleToggle}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all duration-300',
          isFav ? 'text-red-500 fill-current' : 'text-slate-600'
        )}
      />
    </Button>
  );
}
