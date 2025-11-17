
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { user as UserType } from '@/lib/types';
import { sms } from '@/lib/sms';
import { MultiSelect, type Option } from '@/components/ui/multi-select';

export default function AdminMessagingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserType));
        setUsers(usersList);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to fetch users' });
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const userOptions: Option[] = users.map(user => ({
    value: user.uid,
    label: `${user.displayName} (${user.email})`,
    phone: user.phone,
  }));

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in both title and description.' });
      return;
    }
    if (selectedUsers.length === 0) {
      toast({ variant: 'destructive', title: 'No users selected', description: 'Please select at least one user to message.' });
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Send SMS to selected users
      let smsSentCount = 0;
      for (const selected of selectedUsers) {
        if (selected.phone) {
          await sms.send(selected.phone, description);
          smsSentCount++;
        }
      }

      // 2. Create a global notification document in Firestore
      await addDoc(collection(db, 'notifications'), {
        type: 'update',
        title,
        description,
        createdAt: serverTimestamp(),
        isGlobal: true, 
      });

      toast({ 
        title: 'Message Sent', 
        description: `Your message has been sent as a global notification and as an SMS to ${smsSentCount} user(s).` 
      });
      setTitle('');
      setDescription('');
      setSelectedUsers([]);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to Send', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Messaging</h2>
        <p className="text-muted-foreground">Send SMS and in-app notifications to users.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="users">Recipients</Label>
                <MultiSelect
                    options={userOptions}
                    selected={selectedUsers}
                    onChange={setSelectedUsers}
                    className="w-full"
                    placeholder={isFetchingUsers ? "Loading users..." : "Select users..."}
                    disabled={isFetchingUsers}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                placeholder="e.g. New Menu Items!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Message Body (SMS & Notification)</Label>
              <Textarea
                id="description"
                placeholder="Describe the update or announcement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
            <Button type="submit" disabled={isLoading || isFetchingUsers}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
