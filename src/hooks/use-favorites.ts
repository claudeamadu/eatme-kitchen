"use client";

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'eatme-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to parse favorites from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites to localStorage', error);
      }
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(itemId)) {
        return prevFavorites.filter((id) => id !== itemId);
      } else {
        return [...prevFavorites, itemId];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (itemId: string) => {
      return favorites.includes(itemId);
    },
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, isLoaded };
};
