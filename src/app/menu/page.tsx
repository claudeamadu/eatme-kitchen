import { RecipeGrid } from '@/components/recipe-grid';
import { recipes } from '@/lib/recipes';

export default function MenuPage() {
  return (
     <div className="food-pattern">
        <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 pt-6">
            <h1 className="text-4xl font-headline font-bold">Full Menu</h1>
            <p className="text-muted-foreground mt-2">Explore all our delicious recipes.</p>
        </div>
        <RecipeGrid allRecipes={recipes} />
        </div>
    </div>
  );
}
