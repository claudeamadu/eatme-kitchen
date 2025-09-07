
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import type { cart_item } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  items: cart_item[];
  addToCart: (item: Omit<cart_item, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  loyaltyPoints: number;
  total: number;
  isLoaded: boolean;
}

const CART_KEY = 'eatme-cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<cart_item[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let storedCart: string | null = null;
    try {
      storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      // In case of error, cart remains empty
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

  const addToCart = (itemToAdd: Omit<cart_item, 'quantity'> & { quantity?: number }) => {
    const quantityToAdd = itemToAdd.quantity || 1;
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: quantityToAdd }];
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
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);
  
  // Hardcoded loyalty points for now
  const loyaltyPoints = subtotal > 0 ? 20 : 0; 
  const total = useMemo(() => Math.max(0, subtotal - loyaltyPoints), [subtotal, loyaltyPoints]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    loyaltyPoints,
    total,
    isLoaded,
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
