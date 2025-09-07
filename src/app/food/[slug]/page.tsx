
'use client';

import { useState } from 'react';
import { recipes } from '@/lib/recipes';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Flame, Leaf, Minus, Plus, Soup, UtensilsCrossed } from 'lucide-react';
import { FavoritesButton } from '@/components/favorites-button';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function FoodPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const recipe = recipes.find(r => r.slug === params.slug);
  const [quantity, setQuantity] = useState(1);

  if (!recipe) {
    notFound();
  }
  
  // The 'assorted-jollof' slug has its own custom page, so we shouldn't render it here.
  if (recipe.slug === 'assorted-jollof') {
    notFound();
  }

  const price = parseFloat(recipe.nutrition.calories.split(' ')[0]);
  const calculateTotal = () => (price * quantity);


  return (
    <div className="relative min-h-screen food-pattern">
       <div className="absolute top-0 left-0 right-0 h-[45vh]">
        <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            data-ai-hint={recipe.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

       <div className="absolute top-5 left-4 z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-white/80 hover:bg-white backdrop-blur-sm" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute top-5 right-4 z-10">
         <FavoritesButton recipeId={recipe.id} recipeTitle={recipe.title} />
      </div>

      <div className="relative pt-[40vh]">
        <div className="bg-background rounded-t-3xl p-6 pb-32">
          <h1 className="text-3xl font-bold font-headline">{recipe.title}</h1>
          <p className="text-muted-foreground text-base my-4">{recipe.description}</p>
          
           <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-accent"/>
                        <span className="font-semibold">Cuisine:</span>
                        <span>{recipe.cuisine}</span>
                    </div>
                     <Separator/>
                    <div className="flex flex-wrap gap-2">
                        {recipe.dietary.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                     <Separator/>
                    <CardTitle className="text-lg font-headline pt-2">Nutritional Info</CardTitle>
                     <div className="space-y-2">
                        <div className="flex justify-between"><span><Flame className="inline h-4 w-4 mr-1"/>Calories:</span> <span>{recipe.nutrition.calories}</span></div>
                        <div className="flex justify-between"><span><Soup className="inline h-4 w-4 mr-1"/>Protein:</span> <span>{recipe.nutrition.protein}</span></div>
                        <div className="flex justify-between"><span><Leaf className="inline h-4 w-4 mr-1"/>Carbs:</span> <span>{recipe.nutrition.carbs}</span></div>
                        <div className="flex justify-between"><span>Fat:</span> <span>{recipe.nutrition.fat}</span></div>
                     </div>
                </CardContent>
            </Card>
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
          <Button size="lg" className="flex-grow rounded-full bg-destructive/90 backdrop-blur-sm text-destructive-foreground hover:bg-destructive">
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
