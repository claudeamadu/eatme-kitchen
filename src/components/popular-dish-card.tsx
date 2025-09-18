
import type { food_item } from '@/lib/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';

interface PopularDishCardProps {
  item: food_item;
}

export function PopularDishCard({ item }: PopularDishCardProps) {
    const href = `/item/${item.id}`;
    const { addToCart } = useCart();
    const router = useRouter();

    const isCustomizable = !!(item.sizes?.length || item.extras?.length);

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCustomizable) {
            router.push(href);
        } else {
            addToCart({
                id: item.id,
                name: item.title,
                price: item.price,
                imageUrl: item.imageUrl,
                imageHint: item.imageHint,
                quantity: 1,
            });
        }
    };

    const getPriceDisplay = () => {
        if (isCustomizable && item.sizes && item.sizes.length > 0) {
            const prices = item.sizes.map(s => s.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            if (minPrice === maxPrice) {
                return `₵${minPrice.toFixed(2)}`;
            }
            return `₵${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
        }
        return `₵${item.price.toFixed(2)}`;
    };

    return (
        <Link href={href}>
            <div className="bg-card p-3 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
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
                    <p className="text-destructive font-bold text-base my-2">{getPriceDisplay()}</p>
                </div>
                <Button 
                    size="icon" 
                    variant="outline" 
                    className="rounded-full h-9 w-9 border-destructive text-destructive hover:bg-destructive/10 self-end"
                    onClick={handleAddToCartClick}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </Link>
    );
}
