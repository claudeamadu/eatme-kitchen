
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

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
  updateReservation: (updates: Partial<ReservationState>) => void;
  clearReservation: () => void;
  isDetailsFilled: boolean;
  getReservationTotal: () => { durationCost: number; guestsCost: number; total: number };
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [reservation, setReservation] = useState<ReservationState>(initialState);
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
    setIsLoaded(true);
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
      const durationCost = isNaN(durationHours) ? 0 : durationHours * 50;
      const guestsCost = reservation.guests ? 500 : 0;
      const total = durationCost + guestsCost;
      return { durationCost, guestsCost, total };
  }, [reservation.duration, reservation.guests]);


  const value = {
    reservation,
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
