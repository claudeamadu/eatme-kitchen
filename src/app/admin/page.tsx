
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, getDocs } from 'firebase/firestore';
import type { order, user as UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, Users, ShoppingBag } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useOnboarding();

  const [orders, setOrders] = useState<order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
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
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.slice(0, 6)}</TableCell>
                  <TableCell>{format(order.createdAt.toDate(), 'PPpp')}</TableCell>
                  <TableCell>{users.find(u => u.uid === order.uid)?.displayName || order.uid}</TableCell>
                  <TableCell>GHC {order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
