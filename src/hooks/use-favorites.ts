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

  const toggleFavorite = useCallback((recipeId: string) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(recipeId)) {
        return prevFavorites.filter((id) => id !== recipeId);
      } else {
        return [...prevFavorites, recipeId];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (recipeId: string) => {
      return favorites.includes(recipeId);
    },
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, isLoaded };
};
