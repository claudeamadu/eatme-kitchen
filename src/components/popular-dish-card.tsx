import type { Recipe } from '@/lib/recipes';
import Image from 'next/image';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface PopularDishCardProps {
  recipe: Recipe;
}

export function PopularDishCard({ recipe }: PopularDishCardProps) {
    // Special handling for Assorted Jollof to go to its custom page
    const href = recipe.slug === 'assorted-jollof'
      ? `/recipes/assorted-jollof`
      : `/recipes/${recipe.slug}`;

    return (
        <Link href={href}>
            <div className="bg-card p-3 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={100}
                    height={100}
                    className="rounded-xl object-cover w-24 h-24"
                    data-ai-hint={recipe.imageHint}
                />
                <div className="flex-grow">
                    <h3 className="font-bold font-headline text-lg">{recipe.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{recipe.description}</p>
                    <p className="text-destructive font-bold text-base my-2">GHC {recipe.nutrition.calories.split(' ')[0]} - GHC 120</p>
                </div>
                <Button size="icon" variant="outline" className="rounded-full h-9 w-9 border-destructive text-destructive hover:bg-destructive/10 self-end">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </Link>
    );
}
