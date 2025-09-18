
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const timelineRef = collection(orderRef, 'timelines');

    await updateDoc(orderRef, { status: newStatus });
    await addDoc(timelineRef, {
        status: newStatus,
        timestamp: serverTimestamp()
    });
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
                        onValueChange={(value) => handleStatusChange(order.id, value as order_status)}
                        disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                        >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
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
    </>
  );
}
