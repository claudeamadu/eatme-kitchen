
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Bell, XCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { notification, grouped_notifications, notification_type } from '@/lib/types';
import { useOnboarding } from '@/hooks/use-onboarding';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, or } from 'firebase/firestore';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const groupNotifications = (notifications: notification[]): grouped_notifications => {
  return notifications.reduce((acc, notif) => {
    const date = notif.createdAt.toDate();
    let group: string;

    if (isToday(date)) {
      group = 'Today';
    } else if (isYesterday(date)) {
      group = 'Yesterday';
    } else {
      group = format(date, 'dd/MM/yyyy');
    }
    
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(notif);
    return acc;
  }, {} as grouped_notifications);
};


const notificationIcons: Record<notification_type, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  update: Bell,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useOnboarding();
  const [notifications, setNotifications] = useState<notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        or(
            where('uid', '==', user.uid),
            where('isGlobal', '==', true)
        ),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const userNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as notification));
        setNotifications(userNotifications);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const grouped = groupNotifications(notifications);

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Notifications</h1>
      </header>

      <main className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([group, notifs]) => (
            <div key={group} className="mb-6">
              <h2 className="font-bold text-muted-foreground mb-3">{group}</h2>
              <Card className="shadow-lg rounded-2xl">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {notifs.map((notif) => {
                      const Icon = notificationIcons[notif.type];
                      return (
                         <li key={notif.id} className={cn("flex items-start gap-4 p-4", !notif.isRead && "bg-primary/5")}>
                            <div className="relative">
                              <div className={cn("p-2 rounded-full", !notif.isRead && "bg-destructive/10")}>
                                  <Icon className={cn("h-6 w-6", !notif.isRead ? 'text-destructive' : 'text-muted-foreground' )} />
                              </div>
                             {!notif.isRead && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive border-2 border-background"></div>}
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold">{notif.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {notif.description}{' '}
                                  {notif.link && (
                                      <Link href={notif.link.href} className="text-primary font-semibold underline">
                                          {notif.link.text}
                                      </Link>
                                  )}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{format(notif.createdAt.toDate(), 'p')}</p>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
             <div className="text-center py-20 bg-card rounded-lg flex flex-col items-center">
                <Bell className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Notifications Yet</h2>
                <p className="text-muted-foreground mt-2">You have no new notifications.</p>
            </div>
        )}
      </main>
    </div>
  );
}
