
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import type { food_item, category, promo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, ShoppingCart, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useSearchParams } from 'next/navigation';

const calculateDiscountedPrice = (price: number, promo: promo | null): number => {
    if (!promo || !promo.discountType || promo.discountType === 'none' || !promo.discountValue) {
        return price;
    }
    if (promo.discountType === 'fixed') {
        return Math.max(0, price - promo.discountValue);
    }
    if (promo.discountType === 'percentage') {
        return price * (1 - promo.discountValue / 100);
    }
    return price;
};

const MenuItemCard = ({ item, promo }: { item: food_item, promo: promo | null }) => {
    const { addToCart } = useCart();
    const href = `/item/${item.id}${promo ? `?promo=${promo.id}` : ''}`;
      
    const isCustomizable = !!(item.sizes?.length || item.extras?.length);

    const originalPrice = item.price;
    const discountedPrice = calculateDiscountedPrice(originalPrice, promo);
    const hasDiscount = discountedPrice < originalPrice;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isCustomizable) {
            // Let the Link handle navigation
            return;
        }

        addToCart({
            id: item.id,
            name: item.title,
            price: discountedPrice,
            imageUrl: item.imageUrl,
            imageHint: item.imageHint,
            quantity: 1,
        });
    }

    return (
        <Link href={href}>
            <div className="bg-card mb-4 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
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
                    <div className="flex items-center gap-2 my-2">
                        <p className="text-destructive font-bold text-base">₵{discountedPrice.toFixed(2)}</p>
                        {hasDiscount && <p className="text-muted-foreground line-through text-sm">₵{originalPrice.toFixed(2)}</p>}
                    </div>
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

function MenuComponent() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [foodItems, setFoodItems] = useState<food_item[]>([]);
    const [categories, setCategories] = useState<category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activePromo, setActivePromo] = useState<promo | null>(null);

    const searchParams = useSearchParams();
    const promoId = searchParams.get('promo');

    useEffect(() => {
        if (promoId) {
            const fetchPromo = async () => {
                const promoRef = doc(db, 'promos', promoId);
                const promoSnap = await getDoc(promoRef);
                if (promoSnap.exists()) {
                    setActivePromo({ id: promoSnap.id, ...promoSnap.data() } as promo);
                }
            };
            fetchPromo();
        } else {
            setActivePromo(null);
        }
    }, [promoId]);

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
                                <MenuItemCard key={item.id} item={item} promo={activePromo} />
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

export default function MenuPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <MenuComponent />
        </Suspense>
    );
}
