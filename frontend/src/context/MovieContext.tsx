import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Movie } from '../types';
import { apiClient } from '../services/api';

interface MovieContextType {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  filteredMovies: Movie[];
  fetchMovies: () => Promise<void>;
  getMovieById: (id: string) => Promise<Movie | null>;
  searchMovies: (query: string) => void;
  filterByGenre: (genre: string) => void;
  createMovie: (data: any) => Promise<void>;
  clearError: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMovies();
      if (response.data) {
        setMovies(response.data);
        setFilteredMovies(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch movies';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMovieById = useCallback(async (id: string): Promise<Movie | null> => {
    try {
      const response = await apiClient.getMovieById(id);
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch movie';
      setError(errorMessage);
      return null;
    }
  }, []);

  const searchMovies = useCallback((query: string) => {
    const filtered = movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [movies]);

  const filterByGenre = useCallback((genre: string) => {
    if (!genre) {
      setFilteredMovies(movies);
      return;
    }
    const filtered = movies.filter((movie) =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [movies]);

  const createMovie = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.createMovie(data);
      if (response.data) {
        setMovies([...movies, response.data]);
        setFilteredMovies([...filteredMovies, response.data]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create movie';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [movies, filteredMovies]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: MovieContextType = {
    movies,
    isLoading,
    error,
    filteredMovies,
    fetchMovies,
    getMovieById,
    searchMovies,
    filterByGenre,
    createMovie,
    clearError,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovie = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovie must be used within a MovieProvider');
  }
  return context;
};
