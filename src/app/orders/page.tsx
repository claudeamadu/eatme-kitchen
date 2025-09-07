
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MoreVertical, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { order, order_status } from '@/lib/types';
import { useOnboarding } from '@/hooks/use-onboarding';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';


const statusColors: { [key in order_status]: string } = {
  Ongoing: 'text-orange-500 bg-orange-100',
  Completed: 'text-green-600 bg-green-100',
  Cancelled: 'text-red-600 bg-red-100',
};

const OrderCard = ({ order }: { order: order }) => {
  const displayItems = order.items.slice(0, 2);
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href={`/orders/${order.id}`} passHref>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row justify-between items-start pb-2">
            <div>
              <p className="text-sm text-muted-foreground">Order No. {order.id.slice(0,6)}</p>
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
              {totalItems > 1 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  + {totalItems - 1} other{totalItems > 2 ? 's' : ''}
                </span>
              )}
            </h3>
            <p className="text-lg font-bold text-destructive my-2">GHC {order.total.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              {displayItems.map((item, index) => (
                <Image
                  key={index}
                  src={item.imageUrl}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover w-16 h-16"
                  data-ai-hint={item.imageHint}
                />
              ))}
            </div>
          </CardContent>
        </Card>
    </Link>
  );
};


export default function OrdersPage() {
    const { user } = useOnboarding();
    const [orders, setOrders] = useState<order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const ordersQuery = query(
                collection(db, 'orders'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
                const userOrders: order[] = [];
                snapshot.forEach(doc => {
                    userOrders.push({ id: doc.id, ...doc.data() } as order);
                });
                setOrders(userOrders);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching orders:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            setIsLoading(false);
        }
    }, [user]);

  return (
    <div className="food-pattern min-h-screen">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-4xl font-headline font-bold">Orders</h1>
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
      </header>
      <main className="container mx-auto px-4 pb-8">
        {isLoading ? (
            <div className="flex justify-center items-center p-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : orders.length > 0 ? (
            <div className="space-y-4">
            {orders.map(order => (
                <OrderCard key={order.id} order={order} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-card rounded-lg flex flex-col items-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Orders Yet</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                    You haven't placed any orders yet. Let's change that!
                </p>
                <Link href="/menu" passHref>
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        )}
      </main>
    </div>
  );
}
