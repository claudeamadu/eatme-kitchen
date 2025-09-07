
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { order, user as UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, Users, ShoppingBag, LogOut } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const statusColors: { [key: string]: string } = {
  Ongoing: 'text-orange-500 bg-orange-100',
  Completed: 'text-green-600 bg-green-100',
  Cancelled: 'text-red-600 bg-red-100',
};

export default function AdminPage() {
  const { user } = useOnboarding();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('orders');
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
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const summaryStats = useMemo(() => ({
    totalOrders: orders.length,
    ongoingOrders: orders.filter(o => o.status === 'Ongoing').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    totalUsers: users.length,
  }), [orders, users]);

  return (
    <div className="flex min-h-screen">
       <aside className="w-64 bg-background p-6 flex flex-col justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary mb-8">Admin Panel</h1>
                <nav className="space-y-2">
                <Button variant={activeTab === 'orders' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('orders')}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                </Button>
                <Button variant={activeTab === 'users' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('users')}>
                    <Users className="mr-2 h-4 w-4" /> Users
                </Button>
                </nav>
            </div>
            <div>
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
      </aside>

      <main className="flex-1 p-8">
        <header>
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
                <CardTitle>{activeTab === 'orders' ? 'All Orders' : 'All Users'}</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === 'orders' ? (
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
                    {orders.map(order => (
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
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.uid}</TableCell>
                        <TableCell>{u.displayName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
