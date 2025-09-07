import { RecipeGrid } from '@/components/recipe-grid';
import { recipes } from '@/lib/recipes';

export default function HomePage() {
  return (
    <div className="food-pattern">
      <section className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary">
            EatMe
          </h1>
          <p className="text-lg md:text-xl mt-4 text-muted-foreground max-w-2xl mx-auto">
            Your Culinary Companion. Discover delicious recipes, save your favorites, and get cooking!
          </p>
        </div>

        <RecipeGrid allRecipes={recipes} />
      </section>
    </div>
  );
}
