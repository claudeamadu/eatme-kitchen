
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { order, user as UserType, order_status } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, View } from 'lucide-react';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const orderStatuses: order_status[] = ['Pending', 'Confirmed', 'Ready', 'Completed', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as order));
      setOrders(allOrders);
      setIsLoading(false);
    });

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserType));
      setUsers(allUsers);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: order_status) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
    
    const timelineRef = collection(orderRef, 'timelines');
    await addDoc(timelineRef, {
        status: newStatus,
        timestamp: serverTimestamp()
    });
  };

  const handleSelectStatusChange = (order: order, newStatus: order_status) => {
      if (newStatus === 'Cancelled') {
          setOrderToCancel(order);
          setCancellationReason('');
          setIsCancelDialogOpen(true);
      } else {
          handleStatusChange(order.id, newStatus);
      }
  };

  const handleConfirmCancellation = async () => {
    if (!orderToCancel || !cancellationReason) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cancellation reason is required.' });
        return;
    }

    try {
        // 1. Update order status and timeline
        await handleStatusChange(orderToCancel.id, 'Cancelled');
        
        // 2. Create notification for the user
        const notificationRef = collection(db, 'users', orderToCancel.uid, 'notifications');
        await addDoc(notificationRef, {
            type: 'error',
            title: `Order #${orderToCancel.id.slice(0, 6)} Cancelled`,
            description: `Reason: ${cancellationReason}`,
            createdAt: serverTimestamp(),
            isRead: false,
            link: { href: `/orders/${orderToCancel.id}`, text: 'View Order' }
        });
        
        toast({ title: 'Order Cancelled', description: 'The user has been notified.' });

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to cancel order: ${error.message}` });
    } finally {
        setIsCancelDialogOpen(false);
        setOrderToCancel(null);
        setCancellationReason('');
    }
  };

  
  const handleViewOrder = (order: order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold">All Orders</h2>
        <p className="text-muted-foreground">Manage and track all customer orders.</p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => {
                const customer = users.find(u => u.uid === order.uid);
                return (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 6)}</TableCell>
                    <TableCell>{format(order.createdAt.toDate(), 'PPpp')}</TableCell>
                    <TableCell>{customer?.displayName || order.uid}</TableCell>
                    <TableCell>{customer?.phone || 'N/A'}</TableCell>
                    <TableCell>₵{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                        <Select 
                        value={order.status} 
                        onValueChange={(value) => handleSelectStatusChange(order, value as order_status)}
                        disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                        >
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {orderStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell>
                        <Button variant="outline" size="icon" onClick={() => handleViewOrder(order)}>
                            <View className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <OrderDetailModal order={selectedOrder} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                      Please provide a reason for cancelling this order. This will be sent to the customer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea 
                placeholder="e.g., Item out of stock, technical issue, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
              <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmCancellation} disabled={!cancellationReason}>Confirm Cancellation</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
