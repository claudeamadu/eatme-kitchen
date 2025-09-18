
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import type { order, user as UserType, order_status, cart_item } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineEvent {
    id: string;
    status: order_status;
    timestamp: any;
}

const statusColors: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-600',
  Confirmed: 'bg-blue-100 text-blue-600',
  Ready: 'bg-purple-100 text-purple-600',
  Ongoing: 'bg-orange-100 text-orange-600', // Kept for backward compatibility if needed
  Completed: 'bg-green-100 text-green-600',
  Cancelled: 'bg-red-100 text-red-600',
};

interface OrderDetailModalProps {
    order: order | null;
    isOpen: boolean;
    onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
    const [customer, setCustomer] = useState<UserType | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!order) return;

        setIsLoading(true);
        const userRef = doc(db, 'users', order.uid);
        const unsubUser = onSnapshot(userRef, (userDoc) => {
            if (userDoc.exists()) {
                setCustomer({ uid: userDoc.id, ...userDoc.data() } as UserType);
            }
            setIsLoading(false);
        });

        const timelineQuery = query(collection(db, 'orders', order.id, 'timelines'), orderBy('timestamp', 'asc'));
        const unsubTimeline = onSnapshot(timelineQuery, (snapshot) => {
            const timelineData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent));
            setTimeline(timelineData);
        });

        return () => {
            unsubUser();
            unsubTimeline();
        };
    }, [order]);

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Order #{order.id.slice(0, 6)}</DialogTitle>
                    <DialogDescription>Details for order placed on {format(order.createdAt.toDate(), 'PPP')}</DialogDescription>
                </DialogHeader>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4">
                        <div className="lg:col-span-2 space-y-8">
                             <Card>
                                <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
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
                                                    <TableCell className="text-right font-semibold">₵{(item.price * item.quantity).toFixed(2)}</TableCell>
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
                                        {timeline.map((event) => (
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
                                    <div className="space-y-2">
                                        <p><span className="font-semibold">Name:</span> {customer?.displayName}</p>
                                        <p><span className="font-semibold">Email:</span> {customer?.email}</p>
                                        <p><span className="font-semibold">Phone:</span> {customer?.phone || 'N/A'}</p>
                                    </div>
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
                )}
            </DialogContent>
        </Dialog>
    );
}
