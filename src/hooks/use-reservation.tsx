
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { reservation_config } from '@/lib/types';

const RESERVATION_KEY = 'eatme-reservation';

interface ReservationState {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  period: string;
  duration: string;
  guests: string;
  occasion: string;
  specialInstructions: string;
  name: string;
  phone: string;
}

const initialState: ReservationState = {
  day: '24',
  month: '10',
  year: '2024',
  hour: '10',
  minute: '00',
  period: 'AM',
  duration: '3hrs',
  guests: '9-15 guests',
  occasion: 'Birthday',
  specialInstructions: '',
  name: '',
  phone: '',
};

interface ReservationContextType {
  reservation: ReservationState;
  config: reservation_config | null;
  updateReservation: (updates: Partial<ReservationState>) => void;
  clearReservation: () => void;
  isDetailsFilled: boolean;
  getReservationTotal: () => { durationCost: number; guestsCost: number; total: number };
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [reservation, setReservation] = useState<ReservationState>(initialState);
  const [config, setConfig] = useState<reservation_config | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedReservation = localStorage.getItem(RESERVATION_KEY);
      if (storedReservation) {
        setReservation(JSON.parse(storedReservation));
      }
    } catch (error) {
      console.error('Failed to parse reservation from localStorage', error);
      setReservation(initialState);
    }
    
    const configRef = doc(db, 'config', 'reservation');
    const unsub = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
            setConfig(docSnap.data() as reservation_config);
        } else {
            // Set default config if none exists in Firestore
            setConfig({ ratePerHour: 50, guestRates: { '2-4 guests': 500, '5-8 guests': 500, '9-15 guests': 500, 'All Day': 500 }});
        }
        setIsLoaded(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservation));
      } catch (error) {
        console.error('Failed to save reservation to localStorage', error);
      }
    }
  }, [reservation, isLoaded]);

  const updateReservation = (updates: Partial<ReservationState>) => {
    setReservation((prev) => ({ ...prev, ...updates }));
  };

  const clearReservation = () => {
    setReservation(initialState);
     try {
        localStorage.removeItem(RESERVATION_KEY);
      } catch (error) {
        console.error('Failed to remove reservation from localStorage', error);
      }
  };
  
  const isDetailsFilled = reservation.name.trim() !== '' && reservation.phone.trim() !== '';

  const getReservationTotal = useCallback(() => {
      const durationHours = parseInt(reservation.duration.replace('hrs', '').replace('hr', ''), 10);
      const ratePerHour = config?.ratePerHour || 50;
      const durationCost = isNaN(durationHours) ? 0 : durationHours * ratePerHour;
      
      const guestsCost = config?.guestRates[reservation.guests] || 500;
      
      const total = durationCost + guestsCost;
      return { durationCost, guestsCost, total };
  }, [reservation.duration, reservation.guests, config]);


  const value = {
    reservation,
    config,
    updateReservation,
    clearReservation,
    isDetailsFilled,
    getReservationTotal,
  };

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
};

export const useReservation = (): ReservationContextType => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
