import type { Recipe } from '@/lib/recipes';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { FavoritesButton } from './favorites-button';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';

interface DailySpecialCardProps {
  recipe: Recipe;
}

export function DailySpecialCard({ recipe }: DailySpecialCardProps) {
  const href = recipe.slug === 'assorted-jollof'
    ? `/food/assorted-jollof`
    : `/food/${recipe.slug}`;

  return (
    <Card className="w-full shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-3">
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={120}
                    height={120}
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md"
                    data-ai-hint={recipe.imageHint}
                />
            </div>
            <Link href={href}>
                <CardTitle className="text-lg font-headline hover:text-primary transition-colors">{recipe.title}</CardTitle>
            </Link>
             <CardDescription className="text-sm line-clamp-2 mt-1 mb-3">
                {recipe.description}
            </CardDescription>
            <div className="flex justify-between items-center">
                <p className="text-destructive font-bold text-lg">GHC {recipe.nutrition.calories.split(' ')[0]}</p>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-red-500">
                    <Heart className="h-5 w-5" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
