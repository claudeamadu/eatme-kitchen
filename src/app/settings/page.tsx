'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, CreditCard, Gift, LogOut, ShieldQuestion, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';

const menuItems = [
    { label: 'My Profile', icon: User, href: '/settings/profile' },
    { label: 'Payment Methods', icon: CreditCard, href: '#' },
    { label: 'Loyalty Rewards', icon: Gift, href: '#' },
    { label: 'Help Center', icon: ShieldQuestion, href: '#' },
    { label: 'Logout', icon: LogOut, className: 'text-destructive', action: 'logout' },
];

export default function SettingsPage() {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleMenuItemClick = (action?: string) => {
        if (action === 'logout') {
            setIsLogoutModalOpen(true);
        }
    };

    return (
        <div className="food-pattern min-h-screen">
            <header className="container mx-auto px-4 py-6">
                <h1 className="text-4xl font-headline font-bold">Settings</h1>
            </header>

            <main className="container mx-auto px-4">
                <Card className="p-6 flex items-center gap-4 mb-8 shadow-lg bg-card">
                    <Avatar className="h-20 w-20 border-4 border-background">
                        <AvatarImage src="https://i.pravatar.cc/150?u=sylvia" alt="Sylvia" />
                        <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold">Sylvia</h1>
                        <p className="text-muted-foreground">sylvia@example.com</p>
                    </div>
                </Card>

                <Card className="shadow-lg">
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    {item.href ? (
                                        <Link href={item.href} passHref>
                                            <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                                                <item.icon className={`h-5 w-5 ${item.className || 'text-muted-foreground'}`} />
                                                <span className={`flex-grow ${item.className || 'font-medium'}`}>{item.label}</span>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </button>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleMenuItemClick(item.action)}
                                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <item.icon className={`h-5 w-5 ${item.className || 'text-muted-foreground'}`} />
                                            <span className={`flex-grow ${item.className || 'font-medium'}`}>{item.label}</span>
                                            {item.label !== 'Logout' && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <AlertDialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                <AlertDialogContent className="max-w-xs rounded-2xl">
                    <AlertDialogHeader className="text-center items-center">
                         <div className="p-3 rounded-full bg-destructive/10 mb-2">
                             <LogOut className="h-8 w-8 text-destructive" />
                         </div>
                        <AlertDialogTitle>Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to logout?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <AlertDialogCancel className="w-full rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="w-full rounded-full bg-destructive hover:bg-destructive/90">Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
