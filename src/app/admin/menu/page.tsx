
'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { food_item, category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}


export default function AdminMenuPage() {
    const [activeTab, setActiveTab] = useState('food-items');
    const [foodItems, setFoodItems] = useState<food_item[]>([]);
    const [categories, setCategories] = useState<category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isFoodItemDialogOpen, setIsFoodItemDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [currentFoodItem, setCurrentFoodItem] = useState<Partial<food_item> | null>(null);
    const [currentCategory, setCurrentCategory] = useState<Partial<category> | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'food' | 'category' } | null>(null);
    
    const { toast } = useToast();

    useEffect(() => {
        const unsubFood = onSnapshot(collection(db, 'foodItems'), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as food_item));
            setFoodItems(items);
            setIsLoading(false);
        });

        const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as category));
            setCategories(cats);
        });

        return () => {
            unsubFood();
            unsubCategories();
        };
    }, []);

    const handleOpenFoodItemDialog = (item: food_item | null = null) => {
        setCurrentFoodItem(item || { title: '', description: '', price: 0, cuisine: '', imageUrl: '', imageHint: '', dietary: [], isDeleted: false, slug: '' });
        setIsFoodItemDialogOpen(true);
    };
    
    const handleOpenCategoryDialog = (category: category | null = null) => {
        setCurrentCategory(category || { name: '', image: '' });
        setIsCategoryDialogOpen(true);
    };

    const handleSaveFoodItem = async () => {
        if (!currentFoodItem || !currentFoodItem.title) return;
        
        const foodData = {
            ...currentFoodItem,
            slug: currentFoodItem.slug || slugify(currentFoodItem.title)
        };

        try {
            if (foodData.id) {
                const { id, ...data } = foodData;
                await updateDoc(doc(db, 'foodItems', id), data);
                toast({ title: 'Success', description: 'Food item updated.' });
            } else {
                 const { id, ...data } = foodData;
                await addDoc(collection(db, 'foodItems'), { ...data, createdAt: serverTimestamp() });
                toast({ title: 'Success', description: 'Food item added.' });
            }
            setIsFoodItemDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const handleSaveCategory = async () => {
        if (!currentCategory) return;
        try {
            if (currentCategory.id) {
                const { id, ...data } = currentCategory;
                await updateDoc(doc(db, 'categories', id), data);
                toast({ title: 'Success', description: 'Category updated.' });
            } else {
                await addDoc(collection(db, 'categories'), { ...currentCategory });
                toast({ title: 'Success', description: 'Category added.' });
            }
            setIsCategoryDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleDeleteClick = (id: string, type: 'food' | 'category') => {
        setItemToDelete({ id, type });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'food') {
                await updateDoc(doc(db, 'foodItems', itemToDelete.id), { isDeleted: true });
                toast({ title: 'Success', description: 'Food item has been soft deleted.' });
            } else {
                // Before deleting category, check if any food item is using it
                const isCategoryInUse = foodItems.some(item => item.cuisine === categories.find(c => c.id === itemToDelete.id)?.name);
                if (isCategoryInUse) {
                    toast({ variant: 'destructive', title: 'Cannot Delete', description: 'This category is still in use by some food items.'});
                } else {
                    await deleteDoc(doc(db, 'categories', itemToDelete.id));
                    toast({ title: 'Success', description: 'Category has been deleted.' });
                }
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
            <header className="mb-8">
                <h2 className="text-3xl font-bold">Menu Management</h2>
                <p className="text-muted-foreground">Manage your food items and categories.</p>
            </header>

            <div className="flex gap-2 mb-4">
                <Button onClick={() => setActiveTab('food-items')} variant={activeTab === 'food-items' ? 'secondary' : 'ghost'}>Food Items</Button>
                <Button onClick={() => setActiveTab('categories')} variant={activeTab === 'categories' ? 'secondary' : 'ghost'}>Categories</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{activeTab === 'food-items' ? 'Food Items' : 'Categories'}</CardTitle>
                        <Button onClick={() => activeTab === 'food-items' ? handleOpenFoodItemDialog() : handleOpenCategoryDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === 'food-items' ? (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {foodItems.map(item => (
                                    <TableRow key={item.id} className={item.isDeleted ? 'opacity-50' : ''}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>GHC {item.price.toFixed(2)}</TableCell>
                                        <TableCell>{item.cuisine}</TableCell>
                                        <TableCell>{item.isDeleted ? 'Deleted' : 'Active'}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="icon" onClick={() => handleOpenFoodItemDialog(item)}><Edit className="h-4 w-4" /></Button>
                                            {!item.isDeleted && <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item.id, 'food')}><Trash2 className="h-4 w-4" /></Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {categories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell>{cat.name}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="icon" onClick={() => handleOpenCategoryDialog(cat)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(cat.id, 'category')}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Food Item Dialog */}
            <Dialog open={isFoodItemDialogOpen} onOpenChange={setIsFoodItemDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader><DialogTitle>{currentFoodItem?.id ? 'Edit' : 'Add'} Food Item</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Title</Label><Input className="col-span-3" value={currentFoodItem?.title} onChange={(e) => setCurrentFoodItem(p => p ? {...p, title: e.target.value} : null)} /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Description</Label><Textarea className="col-span-3" value={currentFoodItem?.description} onChange={(e) => setCurrentFoodItem(p => p ? {...p, description: e.target.value} : null)} /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Price (GHC)</Label><Input type="number" className="col-span-3" value={currentFoodItem?.price} onChange={(e) => setCurrentFoodItem(p => p ? {...p, price: parseFloat(e.target.value) || 0} : null)} /></div>
                        <div className="grid grid-cols-4 items-center gap-4">
                           <Label className="text-right">Category</Label>
                           <Select value={currentFoodItem?.cuisine} onValueChange={(value) => setCurrentFoodItem(p => p ? {...p, cuisine: value} : null)}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Image URL</Label><Input className="col-span-3" value={currentFoodItem?.imageUrl} onChange={(e) => setCurrentFoodItem(p => p ? {...p, imageUrl: e.target.value} : null)} /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Image Hint</Label><Input className="col-span-3" value={currentFoodItem?.imageHint} onChange={(e) => setCurrentFoodItem(p => p ? {...p, imageHint: e.target.value} : null)} /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Slug</Label><Input className="col-span-3" value={currentFoodItem?.slug} onChange={(e) => setCurrentFoodItem(p => p ? {...p, slug: e.target.value} : null)} placeholder="auto-generated from title" /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Is Deleted</Label><Switch className="col-span-3" checked={currentFoodItem?.isDeleted} onCheckedChange={(checked) => setCurrentFoodItem(p => p ? {...p, isDeleted: checked} : null)} /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveFoodItem}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{currentCategory?.id ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={currentCategory?.name} onChange={(e) => setCurrentCategory(p => p ? {...p, name: e.target.value} : null)} /></div>
                        <div className="space-y-2"><Label>Image URL</Label><Input value={currentCategory?.image} onChange={(e) => setCurrentCategory(p => p ? {...p, image: e.target.value} : null)} placeholder="For display in category list" /></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveCategory}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. For food items, this will mark it as deleted. For categories, it will be permanently deleted.
                        </DialogDescription>
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

    