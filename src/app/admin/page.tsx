
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
import { useOnboarding } from '@/hooks/use-onboarding';
import Link from 'next/link';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';

export default function AdminPage() {
  const { user } = useOnboarding();

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

  const handleViewOrder = (order: order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  const handleStatusChange = async (orderId: string, newStatus: order_status) => {
    const orderRef = doc(db, 'orders', orderId);
    const timelineRef = collection(orderRef, 'timelines');

    await updateDoc(orderRef, { status: newStatus });
    await addDoc(timelineRef, {
        status: newStatus,
        timestamp: serverTimestamp()
    });
  };

  const summaryStats = useMemo(() => ({
    totalOrders: orders.length,
    ongoingOrders: orders.filter(o => o.status === 'Ongoing').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    totalUsers: users.length,
  }), [orders, users]);
  
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

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
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.displayName || user?.email}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
        <Card>
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summaryStats.totalOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ongoing Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summaryStats.ongoingOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summaryStats.completedOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{summaryStats.totalUsers}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all orders</Link>
          </div>
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
              {recentOrders.map(order => {
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
