
'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { promo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadFile } from '@/lib/firebase-storage';

export default function AdminPromosPage() {
    const [promos, setPromos] = useState<promo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [currentPromo, setCurrentPromo] = useState<Partial<promo> | null>(null);
    const [promoImageFile, setPromoImageFile] = useState<File | null>(null);

    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'promos'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as promo));
            setPromos(items);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const handleOpenDialog = (item: promo | null = null) => {
        setCurrentPromo(item || { title: '', description: '', buttonText: '', imageUrl: 'https://picsum.photos/seed/promo/150/150', imageHint: 'promo offer', imagePosition: 'right', href: '/menu' });
        setPromoImageFile(null);
        setIsDialogOpen(true);
    };

    const handlePromoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPromoImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                handlePromoChange('imageUrl', event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = async () => {
        if (!currentPromo || !currentPromo.title) return;
        
        let dataToSave: Partial<promo> = { ...currentPromo };
        const promoId = dataToSave.id || doc(collection(db, 'promos')).id;
        
        try {
            if (promoImageFile) {
                const imagePath = `promos/${promoId}/image_${promoImageFile.name}`;
                dataToSave.imageUrl = await uploadFile(promoImageFile, imagePath);
            }
            
            const { id, ...dataForFirestore } = dataToSave;

            if (id) {
                await updateDoc(doc(db, 'promos', id), dataForFirestore);
                toast({ title: 'Success', description: 'Promo updated.' });
            } else {
                await addDoc(collection(db, 'promos'), { ...dataForFirestore, createdAt: serverTimestamp() });
                toast({ title: 'Success', description: 'Promo added.' });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteDoc(doc(db, 'promos', itemToDelete));
            toast({ title: 'Success', description: 'Promo has been deleted.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handlePromoChange = (field: keyof promo, value: any) => {
        setCurrentPromo(p => p ? { ...p, [field]: value } : null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold">Promo Management</h2>
                <p className="text-muted-foreground">Manage your promotional banners.</p>
            </header>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Promos</CardTitle>
                        <Button onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {promos.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.title}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>{currentPromo?.id ? 'Edit' : 'Add'} Promo</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2"><Label>Title</Label><Input value={currentPromo?.title} onChange={(e) => handlePromoChange('title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={currentPromo?.description} onChange={(e) => handlePromoChange('description', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button Text</Label><Input value={currentPromo?.buttonText} onChange={(e) => handlePromoChange('buttonText', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button Link (href)</Label><Input value={currentPromo?.href} onChange={(e) => handlePromoChange('href', e.target.value)} /></div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                            <div className="flex items-center gap-4">
                                {currentPromo?.imageUrl && <Image src={currentPromo.imageUrl} alt="preview" width={64} height={64} className="rounded-md object-cover h-16 w-16" />}
                                <Input type="file" onChange={handlePromoImageChange} />
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Image Hint</Label><Input value={currentPromo?.imageHint} onChange={(e) => handlePromoChange('imageHint', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Image Position</Label>
                             <Select value={currentPromo?.imagePosition} onValueChange={(value) => handlePromoChange('imagePosition', value)}>
                                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="right">Right</SelectItem>
                                    <SelectItem value="left">Left</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>This action cannot be undone. This will permanently delete the promo.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
