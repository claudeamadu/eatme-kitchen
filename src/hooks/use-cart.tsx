
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { cart_item, LoyaltyData } from '@/lib/types';
import { useToast } from './use-toast';
import { useOnboarding } from './use-onboarding';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CartContextType {
  items: cart_item[];
  addToCart: (item: Omit<cart_item, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  isLoaded: boolean;
  availablePoints: number;
  appliedPoints: number;
  appliedAmount: number;
  applyLoyaltyPoints: (points: number) => void;
}

const CART_KEY = 'eatme-cart';
const POINTS_TO_GHC= 0.5; // 1 point = 0.5 GHC

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<cart_item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [appliedPoints, setAppliedPoints] = useState(0);
  const { toast } = useToast();
  const { user } = useOnboarding();

  useEffect(() => {
    let storedCart: string | null = null;
    try {
      storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      setItems([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage', error);
      }
    }
  }, [items, isLoaded]);

   useEffect(() => {
    if (user) {
      const loyaltyRef = doc(db, 'users', user.uid, 'loyalty', 'data');
      const unsubscribe = onSnapshot(loyaltyRef, (docSnap) => {
        if (docSnap.exists()) {
          const loyaltyData = docSnap.data() as LoyaltyData;
          setAvailablePoints(loyaltyData.points || 0);
        } else {
          setAvailablePoints(0);
        }
      });
      return () => unsubscribe();
    } else {
      setAvailablePoints(0);
    }
  }, [user]);

  const addToCart = (itemToAdd: Omit<cart_item, 'quantity'> & { quantity?: number }) => {
    const quantityToAdd = itemToAdd.quantity || 1;
    // Make ID unique based on price to handle promo items separately
    const uniqueId = `${itemToAdd.id}-${itemToAdd.price}`;

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === uniqueId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === uniqueId ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prevItems, { ...itemToAdd, id: uniqueId, quantity: quantityToAdd }];
    });
    toast({
      title: "Added to Cart",
      description: `${itemToAdd.name} has been added to your cart.`,
    })
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPoints(0);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);
  
  const appliedAmount = useMemo(() => appliedPoints * POINTS_TO_GHC, [appliedPoints]);
  const total = useMemo(() => Math.max(0, subtotal - appliedAmount), [subtotal, appliedAmount]);

  const applyLoyaltyPoints = useCallback((pointsToApply: number) => {
    if (pointsToApply > availablePoints) {
        toast({ variant: 'destructive', title: 'Not enough points', description: `You only have ${availablePoints} points.` });
        return;
    }
    
    const maxApplicableAmount = subtotal;
    const maxApplicablePoints = Math.ceil(maxApplicableAmount / POINTS_TO_GHC);
    const points = Math.min(pointsToApply, maxApplicablePoints);

    setAppliedPoints(points);
    toast({ title: 'Points Applied', description: `${points} points have been applied to your order.` });
  }, [availablePoints, subtotal, toast]);

  useEffect(() => {
    // Reset applied points if cart changes
    setAppliedPoints(0);
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    total,
    isLoaded,
    availablePoints,
    appliedPoints,
    appliedAmount,
    applyLoyaltyPoints,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
