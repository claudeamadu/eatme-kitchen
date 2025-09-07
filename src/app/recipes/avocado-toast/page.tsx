import { recipes } from '@/lib/recipes';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, Flame, Leaf, Soup } from 'lucide-react';
import { FavoritesButton } from '@/components/favorites-button';
import { Separator } from '@/components/ui/separator';

export default function RecipePage() {
  const recipe = recipes.find(r => r.slug === 'avocado-toast');

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">{recipe.description}</p>
        </div>
        
        <Card className="overflow-hidden mb-8">
            <div className="relative">
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={1200}
                    height={600}
                    className="w-full h-64 md:h-96 object-cover"
                    data-ai-hint={recipe.imageHint}
                />
                <div className="absolute top-4 right-4">
                    <FavoritesButton recipeId={recipe.id} recipeTitle={recipe.title} />
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-disc list-inside text-base">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Separator className="my-8" />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 list-decimal list-inside">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="pl-2">
                      <p className="inline">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <CardTitle className="text-xl font-headline pt-2">Nutritional Info</CardTitle>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span><Flame className="inline h-4 w-4 mr-1"/>Calories:</span> <span>{recipe.nutrition.calories}</span></div>
                        <div className="flex justify-between"><span><Soup className="inline h-4 w-4 mr-1"/>Protein:</span> <span>{recipe.nutrition.protein}</span></div>
                        <div className="flex justify-between"><span><Leaf className="inline h-4 w-4 mr-1"/>Carbs:</span> <span>{recipe.nutrition.carbs}</span></div>
                        <div className="flex justify-between"><span>Fat:</span> <span>{recipe.nutrition.fat}</span></div>
                     </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </article>
    </div>
  );
}
