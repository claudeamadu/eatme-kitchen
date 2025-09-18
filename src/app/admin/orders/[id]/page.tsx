
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import type { order, user as UserType, order_status, cart_item } from '@/lib/types';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TimelineEvent {
    id: string;
    status: order_status;
    timestamp: any;
}

const statusColors: { [key: string]: string } = {
  Ongoing: 'bg-orange-100 text-orange-600',
  Completed: 'bg-green-100 text-green-600',
  Cancelled: 'bg-red-100 text-red-600',
};

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<order | null>(null);
    const [customer, setCustomer] = useState<UserType | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const orderRef = doc(db, 'orders', id as string);
        const unsubOrder = onSnapshot(orderRef, (doc) => {
            if (doc.exists()) {
                const orderData = { id: doc.id, ...doc.data() } as order;
                setOrder(orderData);
                
                // Fetch customer details
                const userRef = doc(db, 'users', orderData.uid);
                onSnapshot(userRef, (userDoc) => {
                    if (userDoc.exists()) {
                        setCustomer({ uid: userDoc.id, ...userDoc.data() } as UserType);
                    }
                });
            }
            setIsLoading(false);
        });

        const timelineQuery = query(collection(db, 'orders', id as string, 'timelines'), orderBy('timestamp', 'asc'));
        const unsubTimeline = onSnapshot(timelineQuery, (snapshot) => {
            const timelineData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEvent));
            setTimeline(timelineData);
        });

        return () => {
            unsubOrder();
            unsubTimeline();
        };
    }, [id]);
    
    const handleStatusChange = async (orderId: string, newStatus: order_status) => {
        const orderRef = doc(db, 'orders', orderId);
        const timelineRef = collection(orderRef, 'timelines');

        await updateDoc(orderRef, { status: newStatus });
        await addDoc(timelineRef, {
            status: newStatus,
            timestamp: serverTimestamp()
        });
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!order) {
        return <div className="flex h-full items-center justify-center"><p>Order not found.</p></div>;
    }

    return (
        <>
            <header className="mb-8 flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold">Order #{order.id.slice(0, 6)}</h2>
                    <p className="text-muted-foreground">Details for order placed on {format(order.createdAt.toDate(), 'PPP')}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Order Details</CardTitle>
                            <Select 
                                value={order.status} 
                                onValueChange={(value) => handleStatusChange(order.id, value as order_status)}
                                disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item: cart_item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md" />
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.extras && <p className="text-xs text-muted-foreground">{item.extras}</p>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₵{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                             <div className="mt-4 pt-4 border-t flex justify-end">
                                <p className="text-xl font-bold">Total: ₵{order.total.toFixed(2)}</p>
                             </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
                        <CardContent>
                            <div className="relative pl-6">
                                <div className="absolute left-3 top-0 h-full w-0.5 bg-border" />
                                {timeline.map((event, index) => (
                                    <div key={event.id} className="relative mb-6">
                                        <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary" />
                                        <p className="font-semibold">{event.status}</p>
                                        <p className="text-sm text-muted-foreground">{event.timestamp ? format(event.timestamp.toDate(), 'PPpp') : 'Updating...'}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
                        <CardContent>
                            {customer ? (
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Name:</span> {customer.displayName}</p>
                                    <p><span className="font-semibold">Email:</span> {customer.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {customer.phone || 'N/A'}</p>
                                </div>
                            ) : <Loader2 className="h-5 w-5 animate-spin" />}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                        <CardContent>
                           <Badge className={cn("px-4 py-2 text-base font-bold rounded-md border-none", statusColors[order.status])}>
                                {order.status}
                           </Badge>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
