
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Bell, XCircle, CheckCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type NotificationType = 'success' | 'error' | 'info' | 'update';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  link?: {
    href: string;
    text: string;
  };
}

interface GroupedNotifications {
  [group: string]: Notification[];
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Order confirmed',
    description: 'The restaurant has received your order and is processing it now. You will be notified once order is ready.',
    time: '3:12PM',
    isRead: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Payment complete',
    description: 'Your payment of GHC250 for your order has been processed successfully.',
    time: '3:12PM',
    isRead: true,
    link: { href: '#', text: 'View receipt' }
  },
  {
    id: '3',
    type: 'update',
    title: 'Menu update',
    description: 'Discover our new blend of recipes for a mouth watering dish.',
    time: '10:00AM',
    isRead: true,
  },
  {
    id: '4',
    type: 'error',
    title: 'Order cancelled',
    description: 'We could not process your order due to incomplete payment. Kindly check your payment methods.',
    time: '1:08PM',
    isRead: true,
  },
  {
    id: '5',
    type: 'error',
    title: 'Failed Transaction',
    description: 'Your payment of GHC150 failed due to not enough funds. Please load your account and try again.',
    time: '1:08PM',
    isRead: true,
  }
];

const groupedNotifications: GroupedNotifications = {
  "Today": notifications.slice(0, 2),
  "Yesterday": notifications.slice(2, 3),
  "21/11/2024": notifications.slice(3, 5)
};

const notificationIcons: Record<NotificationType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  update: Bell,
};

const notificationColors: Record<NotificationType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  update: 'text-primary',
}


export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Notifications</h1>
      </header>

      <main className="container mx-auto px-4">
        {Object.entries(groupedNotifications).map(([group, notifs]) => (
          <div key={group} className="mb-6">
            <h2 className="font-bold text-muted-foreground mb-3">{group}</h2>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-0">
                <ul className="divide-y">
                  {notifs.map((notif, index) => {
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
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</p>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))}
      </main>
    </div>
  );
}
