
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { food_item, category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, ShoppingCart, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';

const MenuItemCard = ({ item }: { item: food_item }) => {
    const { addToCart } = useCart();
    const href = `/item/${item.id}`;
      
    const isCustomizable = !!(item.sizes?.length || item.extras?.length);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isCustomizable) {
            // If it's customizable, we should navigate to the detail page
            // so the user can select options. A Link wrapper already handles this.
            // But if for some reason a plus button is shown, we can navigate them.
            // For now, the button is hidden for customizable items.
            return;
        }

        addToCart({
            id: item.id,
            name: item.title,
            price: item.price,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            quantity: 1,
        });
    }

    return (
        <Link href={href}>
            <div className="bg-card p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="rounded-xl object-cover w-24 h-24"
                    data-ai-hint={item.imageHint}
                />
                <div className="flex-grow">
                    <h3 className="font-bold font-headline text-lg">{item.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
                    <p className="text-destructive font-bold text-base my-2">GHC {item.price.toFixed(2)}</p>
                </div>
                {!isCustomizable && (
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="rounded-full h-9 w-9 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={handleAddToCart}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </Link>
    );
};


export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [foodItems, setFoodItems] = useState<food_item[]>([]);
    const [categories, setCategories] = useState<category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const foodQuery = query(collection(db, 'foodItems'), where('isDeleted', '!=', true));
        const unsubFood = onSnapshot(foodQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as food_item));
            setFoodItems(items);
            setIsLoading(false);
        });

        const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as category));
            setCategories([{id: 'all', name: 'All', image: ''}, ...cats]);
        });

        return () => {
            unsubFood();
            unsubCategories();
        };
    }, []);

    const filteredFoodItems = foodItems.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.cuisine === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    return (
        <div className="food-pattern min-h-screen">
            <header className="container mx-auto px-4 py-6">
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl font-headline font-bold">Menu</h1>
                    <div className="flex items-center gap-2">
                        <Link href="/cart">
                          <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Link href="/notifications">
                            <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
                                <Bell className="h-6 w-6 text-destructive" />
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 rounded-full bg-destructive text-destructive-foreground">2</Badge>
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="search food, eg. kanzo" className="pl-10 rounded-full bg-card" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </header>
            
            <section className="mb-6">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl font-bold font-headline mb-2">Category</h2>
                </div>
                 <div className="overflow-x-auto">
                    <div className="flex space-x-3 px-4 pb-2">
                        {categories.map((category) => (
                            <button key={category.id} onClick={() => setActiveCategory(category.name)}
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
                </div>
            </section>

            <main className="container mx-auto px-4 pb-24">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFoodItems.length > 0 ? (
                            filteredFoodItems.map(item => (
                                <MenuItemCard key={item.id} item={item} />
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No food items found.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
