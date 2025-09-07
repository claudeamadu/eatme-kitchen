'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();

    return (
        <div className="food-pattern min-h-screen pb-24">
            <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
                <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-headline font-bold">Profile</h1>
            </header>

            <main className="container mx-auto px-4">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                            <AvatarImage src="https://i.pravatar.cc/150?u=sylvia" alt="Sylvia" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 w-10">
                            <Edit2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="pl-1 text-muted-foreground">Username</Label>
                        <Input id="username" defaultValue="Sylvia" className="h-14 rounded-xl text-base bg-card shadow-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone" className="pl-1 text-muted-foreground">Phone Number</Label>
                        <Input id="phone" defaultValue="055 444 1213" className="h-14 rounded-xl text-base bg-card shadow-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dob" className="pl-1 text-muted-foreground">Date of birth</Label>
                        <Input id="dob" defaultValue="" placeholder="DD/MM/YYYY" className="h-14 rounded-xl text-base bg-card shadow-sm" />
                    </div>
                </form>
            </main>

             <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent">
                <Button size="lg" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14">
                    Save
                </Button>
            </div>
        </div>
    );
}
