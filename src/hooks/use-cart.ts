'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageHint?: string;
  extras?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  loyaltyPoints: number;
  total: number;
  isLoaded: boolean;
}

const CART_KEY = 'eatme-cart';

const mockCartItems: CartItem[] = [
    {
        id: '4-medium-tilapia',
        name: 'Assorted Jollof',
        extras: 'Extra Tilapia',
        price: 100,
        quantity: 1,
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'jollof rice',
    },
    {
        id: '1-noodles',
        name: 'Assorted Noodles',
        extras: 'Freshly made noodles with vegetables, chicken, sausage...',
        price: 100,
        quantity: 1,
        imageUrl: 'https://picsum.photos/600/400',
        imageHint: 'noodles',
    }
];


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      // Forcing mock data for demonstration
      setItems(mockCartItems);
      // if (storedCart) {
      //   setItems(JSON.parse(storedCart));
      // }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      setItems(mockCartItems); // Fallback to mock data
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

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
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
