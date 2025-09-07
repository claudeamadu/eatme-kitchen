
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { recipes, type Recipe } from '@/lib/recipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, ShoppingCart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const categories = [
    { name: 'All', image: ''},
    { name: 'Assorted', image: 'https://picsum.photos/100/100?random=10' },
    { name: 'Sea Food', image: 'https://picsum.photos/100/100?random=11' },
    { name: 'Fried Rice', image: 'https://picsum.photos/100/100?random=12' },
    { name: 'Jollof', image: 'https://picsum.photos/100/100?random=13' },
];

const MenuItemCard = ({ recipe }: { recipe: Recipe }) => {
    const href = recipe.slug === 'assorted-jollof'
      ? `/food/assorted-jollof`
      : `/food/${recipe.slug}`;

    return (
        <Link href={href}>
            <div className="bg-card p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
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
                    <p className="text-destructive font-bold text-base my-2">GHC {recipe.nutrition.calories.split(' ')[0]}</p>
                </div>
                <Button size="icon" variant="outline" className="rounded-full h-9 w-9 border-destructive text-destructive hover:bg-destructive/10">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </Link>
    );
};


export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState('Assorted');
    
    return (
        <div className="food-pattern min-h-screen">
            <header className="container mx-auto px-4 py-6">
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl font-headline font-bold">Menu</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                            <Bell className="h-6 w-6 text-destructive" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 rounded-full bg-destructive text-destructive-foreground">2</Badge>
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="search food, eg. kanzo" className="pl-10 rounded-full bg-card" />
                </div>
            </header>
            
            <section className="mb-6">
                <h2 className="text-xl font-bold font-headline container mx-auto px-4 mb-2">Category</h2>
                 <div className="flex overflow-x-auto space-x-3 px-4 pb-2 -mx-4">
                    {categories.map((category) => (
                        <button key={category.name} onClick={() => setActiveCategory(category.name)}
                            className={cn("flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                                activeCategory === category.name ? 'bg-destructive text-destructive-foreground' : 'bg-card'
                            )}
                        >
                            {category.name !== 'All' && category.image && (
                                <Image src={category.image} alt={category.name} width={28} height={28} className="rounded-full w-7 h-7 object-cover"/>
                            )}
                            <span className="font-semibold text-sm">{category.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            <main className="container mx-auto px-4 pb-24">
                <div className="space-y-4">
                    {recipes.map(recipe => (
                       <MenuItemCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            </main>
        </div>
    );
}
