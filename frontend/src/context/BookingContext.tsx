import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Booking, BookingRequest } from '../types';
import { apiClient } from '../services/api';

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  selectedSeats: string[];
  currentBooking: Booking | null;
  toggleSeatSelection: (seatId: string) => void;
  clearSeats: () => void;
  bookSeats: (request: BookingRequest) => Promise<Booking | null>;
  confirmBooking: (bookingId: string) => Promise<Booking | null>;
  getBooking: (id: string) => Promise<Booking | null>;
  getUserBookings: (userId: string) => Promise<void>;
  clearError: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const toggleSeatSelection = useCallback((seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  }, []);

  const clearSeats = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const bookSeats = useCallback(async (request: BookingRequest): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.bookSeats(request);
      if (response.data) {
        setCurrentBooking(response.data);
        setBookings([...bookings, response.data]);
        return response.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to book seats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bookings]);

  const confirmBooking = useCallback(async (bookingId: string): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.confirmBooking(bookingId);
      if (response.data) {
        setCurrentBooking(response.data);
        setBookings(
          bookings.map((b) => (b.id === bookingId ? response.data! : b))
        );
        return response.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to confirm booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bookings]);

  const getBooking = useCallback(async (id: string): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getBooking(id);
      if (response.data) {
        setCurrentBooking(response.data);
        return response.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch booking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserBookings = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUserBookings(userId);
      if (response.data) {
        setBookings(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: BookingContextType = {
    bookings,
    isLoading,
    error,
    selectedSeats,
    currentBooking,
    toggleSeatSelection,
    clearSeats,
    bookSeats,
    confirmBooking,
    getBooking,
    getUserBookings,
    clearError,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
