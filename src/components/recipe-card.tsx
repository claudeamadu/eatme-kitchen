import type { Recipe } from '@/lib/recipes';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoritesButton } from './favorites-button';
import { UtensilsCrossed } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const href = recipe.slug === 'assorted-jollof'
      ? `/food/assorted-jollof`
      : `/food/${recipe.slug}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={href} className="block">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={recipe.imageHint}
          />
        </Link>
        <div className="absolute top-2 right-2">
          <FavoritesButton recipeId={recipe.id} recipeTitle={recipe.title} />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        <Link href={href} className="flex-grow">
          <CardTitle className="text-lg font-headline mb-2 leading-snug hover:text-primary transition-colors">
            {recipe.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
             <UtensilsCrossed className="h-3 w-3" />
            {recipe.cuisine}
          </Badge>
          <div className="flex gap-1">
            {recipe.dietary.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
