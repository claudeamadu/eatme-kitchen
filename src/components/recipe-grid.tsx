"use client";

import { useState, useMemo } from 'react';
import type { recipe } from '@/lib/types';
import { RecipeCard } from './recipe-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

interface RecipeGridProps {
  allRecipes: recipe[];
}

export function RecipeGrid({ allRecipes }: RecipeGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('All');

  const cuisines = useMemo(() => ['All', ...new Set(allRecipes.map(r => r.cuisine))], [allRecipes]);
  const dietaryOptions = useMemo(() => ['All', 'Vegetarian', 'Vegan', 'Gluten-Free'], []);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCuisine = cuisineFilter === 'All' || recipe.cuisine === cuisineFilter;
      const matchesDietary = dietaryFilter === 'All' || recipe.dietary.includes(dietaryFilter);
      return matchesSearch && matchesCuisine && matchesDietary;
    });
  }, [allRecipes, searchTerm, cuisineFilter, dietaryFilter]);

  return (
    <div>
      <div className="mb-8 p-6 bg-card rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-3 lg:col-span-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
                placeholder="Search by recipe or ingredient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
          </div>
          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by cuisine" />
            </SelectTrigger>
            <SelectContent>
              {cuisines.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by dietary need" />
            </SelectTrigger>
            <SelectContent>
              {dietaryOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        {filteredRecipes.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
               <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <h3 className="text-2xl font-semibold">No Recipes Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
