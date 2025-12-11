import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Show } from '../types';
import { apiClient } from '../services/api';

interface ShowContextType {
  shows: Show[];
  isLoading: boolean;
  error: string | null;
  selectedShow: Show | null;
  filterByMovieId: (movieId: string) => Promise<void>;
  fetchUpcomingShows: () => Promise<void>;
  getShowById: (id: string) => Promise<Show | null>;
  setSelectedShow: (show: Show | null) => void;
  clearError: () => void;
}

const ShowContext = createContext<ShowContextType | undefined>(undefined);

export const ShowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const fetchUpcomingShows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUpcomingShows();
      if (response.data) {
        setShows(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch shows';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterByMovieId = useCallback(async (movieId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getShowsByMovieId(movieId);
      if (response.data) {
        setShows(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch shows';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getShowById = useCallback(async (id: string): Promise<Show | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getShowWithSeats(id);
      if (response.data) {
        setSelectedShow(response.data);
        return response.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch show';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ShowContextType = {
    shows,
    isLoading,
    error,
    selectedShow,
    filterByMovieId,
    fetchUpcomingShows,
    getShowById,
    setSelectedShow,
    clearError,
  };

  return <ShowContext.Provider value={value}>{children}</ShowContext.Provider>;
};

export const useShow = () => {
  const context = useContext(ShowContext);
  if (context === undefined) {
    throw new Error('useShow must be used within a ShowProvider');
  }
  return context;
};
