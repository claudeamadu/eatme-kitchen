import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cookingPot } from 'lucide-react';
import { ReceiptText, CookingPot } from 'lucide-react';
import Link from 'next/link';

const pastOrders = [
  {
    id: '1',
    date: '2024-07-20',
    items: ['Classic Spaghetti Carbonara', 'Simple Avocado Toast'],
    total: '35.50',
  },
  {
    id: '2',
    date: '2024-07-15',
    items: ['Easy Chicken Curry'],
    total: '18.00',
  },
];


export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Your Orders</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CookingPot className="w-6 h-6 text-primary" />
            <span>Current Order</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>You have no active orders.</p>
            <Link href="/menu" passHref>
                <Button className="mt-4">Start an Order</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-headline font-semibold mb-4">Past Orders</h2>
        <div className="space-y-4">
          {pastOrders.map(order => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                 <p className="text-lg font-semibold">${order.total}</p>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-muted-foreground">
                    {order.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
