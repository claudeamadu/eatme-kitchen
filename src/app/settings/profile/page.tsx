
'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Edit2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/firebase-storage';

export default function ProfilePage() {
    const router = useRouter();
    const { user, refreshUser } = useOnboarding();
    const { toast } = useToast();
    
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setUsername(user.displayName || '');
            setImagePreview(user.photoURL || null);
            const fetchUserData = async () => {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setPhone(userData.phone || '');
                    setDob(userData.dob || '');
                }
            };
            fetchUserData();
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to update your profile.' });
            return;
        }
        setIsLoading(true);
        try {
            let photoURL = user.photoURL;

            if (profileImageFile) {
                const imagePath = `profile-pictures/${user.uid}`;
                photoURL = await uploadFile(profileImageFile, imagePath);
            }

            // Update auth profile
            await updateProfile(user, { 
                displayName: username,
                photoURL: photoURL,
             });

            // Update firestore document
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: username,
                phone: phone,
                dob: dob,
                photoURL: photoURL,
            }, { merge: true });

            await refreshUser();

            toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
            router.back();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

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
                            <AvatarImage src={imagePreview || `https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.displayName || 'User'} />
                            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 w-10" onClick={() => fileInputRef.current?.click()}>
                            <Edit2 className="h-5 w-5" />
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSave}>
                    <div className="space-y-2">
                        <Label htmlFor="username" className="pl-1 text-muted-foreground">Username</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-14 rounded-xl text-base bg-card shadow-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone" className="pl-1 text-muted-foreground">Phone Number</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 055 444 1213" className="h-14 rounded-xl text-base bg-card shadow-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dob" className="pl-1 text-muted-foreground">Date of birth</Label>
                        <Input id="dob" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="DD/MM/YYYY" className="h-14 rounded-xl text-base bg-card shadow-sm" />
                    </div>
                     <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent">
                        <Button size="lg" type="submit" className="w-full max-w-md mx-auto rounded-full bg-red-600 hover:bg-red-700 text-white text-lg h-14" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
