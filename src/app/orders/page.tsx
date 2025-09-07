'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MoreVertical, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStatus = 'Ongoing' | 'Completed' | 'Cancelled';

const orders = [
  {
    id: '210043',
    status: 'Ongoing' as OrderStatus,
    items: [
      { name: 'Assorted Noodles', image: 'https://picsum.photos/100/100?random=1', hint: 'noodles' },
    ],
    price: '50',
  },
  {
    id: '210025',
    status: 'Completed' as OrderStatus,
    items: [
      { name: 'Steamed Vegetable Rice', image: 'https://picsum.photos/100/100?random=2', hint: 'vegetable rice' },
      { name: 'Assorted Noodles', image: 'https://picsum.photos/100/100?random=3', hint: 'noodles' },
      { name: 'Yam Chips', image: 'https://picsum.photos/100/100?random=4', hint: 'yam chips' },
    ],
    price: '150',
  },
  {
    id: '210003',
    status: 'Cancelled' as OrderStatus,
    items: [
        { name: 'Yam Chips', image: 'https://picsum.photos/100/100?random=5', hint: 'yam chips' }
    ],
    price: '80',
  },
   {
    id: '210123',
    status: 'Completed' as OrderStatus,
    items: [
        { name: 'Yam Chips', image: 'https://picsum.photos/100/100?random=6', hint: 'yam chips' },
        { name: 'Assorted Noodles', image: 'https://picsum.photos/100/100?random=7', hint: 'noodles' },
    ],
    price: '80',
  },
];

const statusColors: { [key in OrderStatus]: string } = {
  Ongoing: 'text-orange-500 bg-orange-100',
  Completed: 'text-green-600 bg-green-100',
  Cancelled: 'text-red-600 bg-red-100',
};

const OrderCard = ({ order }: { order: (typeof orders)[0] }) => {
  const displayItems = order.items.slice(0, 2);
  const remainingItems = order.items.length - displayItems.length;

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <div>
          <p className="text-sm text-muted-foreground">Order No. {order.id}</p>
        </div>
        <div className="flex items-center gap-4">
            <Badge className={cn("px-2 py-1 text-xs font-bold rounded-full border-none", statusColors[order.status])}>
                {order.status}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-bold font-headline">
          {order.items[0].name}
          {order.items.length > 1 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              + {order.items.length - 1} other{order.items.length > 2 ? 's' : ''}
            </span>
          )}
        </h3>
        <p className="text-lg font-bold text-destructive my-2">GHC {order.price}</p>
        <div className="flex items-center gap-2">
          {displayItems.map((item, index) => (
            <Image
              key={index}
              src={item.image}
              alt={item.name}
              width={64}
              height={64}
              className="rounded-lg object-cover w-16 h-16"
              data-ai-hint={item.hint}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


export default function OrdersPage() {
  return (
    <div className="food-pattern min-h-screen">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-4xl font-headline font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="relative bg-card rounded-lg">
            <Bell className="h-6 w-6 text-destructive" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 rounded-full bg-destructive text-destructive-foreground">2</Badge>
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 pb-8">
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </main>
    </div>
  );
}
