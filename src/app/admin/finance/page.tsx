
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AdminFinancePage() {
  const [orders, setOrders] = useState<order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const completedOrdersQuery = query(collection(db, "orders"), where("status", "==", "Completed"));
    const unsubscribe = onSnapshot(completedOrdersQuery, (snapshot) => {
      const completedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as order));
      setOrders(completedOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const financialSummary = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
    };
  }, [orders]);

  const salesData = useMemo(() => {
    const salesByDay: { [key: string]: number } = {};
    orders.forEach(order => {
      const day = format(order.createdAt.toDate(), 'yyyy-MM-dd');
      if (!salesByDay[day]) {
        salesByDay[day] = 0;
      }
      salesByDay[day] += order.total;
    });
    
    return Object.entries(salesByDay)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [orders]);

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
        <h2 className="text-3xl font-bold">Finance</h2>
        <p className="text-muted-foreground">Overview of your financial performance.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">GHC {financialSummary.totalRevenue.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{financialSummary.totalOrders}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average Order Value</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">GHC {financialSummary.averageOrderValue.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `GHC ${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="sales" fill="#f43f5e" name="Sales (GHC)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
