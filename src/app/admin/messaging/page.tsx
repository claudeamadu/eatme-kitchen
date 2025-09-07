
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function AdminMessagingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in both title and description.' });
      return;
    }
    
    setIsLoading(true);
    try {
      // Note: This sends a single notification document.
      // A more robust system would involve a backend function to distribute this to all users.
      await addDoc(collection(db, 'notifications'), {
        type: 'update',
        title,
        description,
        createdAt: serverTimestamp(),
        isGlobal: true, // Flag to identify this as a message for all users
      });
      toast({ title: 'Message Sent', description: 'Your message has been sent to all users.' });
      setTitle('');
      setDescription('');
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
        <p className="text-muted-foreground">Send notifications to all users.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. New Menu Items!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the update or announcement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
