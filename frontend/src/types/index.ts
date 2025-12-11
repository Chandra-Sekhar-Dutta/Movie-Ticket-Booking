// User & Auth Types
export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Movie Types
export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: string;
  posterUrl: string;
  rating?: number;
  cast?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieRequest {
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: string;
  posterUrl: string;
  cast?: string[];
}

// Show Types
export interface Show {
  id: string;
  movieId: string;
  showTime: string;
  date: string;
  totalSeats: number;
  availableSeats: number;
  standardPrice: number;
  premiumPrice: number;
  movie?: Movie;
  seats?: Seat[];
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  showId: string;
  seatNumber: string;
  row: string;
  column: number;
  isAvailable: boolean;
  seatType: 'standard' | 'premium';
  bookedBy?: string;
}

export interface SeatLayout {
  [row: string]: Seat[];
}

export interface CreateShowRequest {
  movieId: string;
  showTime: string;
  date: string;
  totalSeats: number;
  standardPrice: number;
  premiumPrice: number;
}

// Booking Types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

export interface Booking {
  id: string;
  userId: string;
  showId: string;
  bookingReference: string;
  totalSeats: number;
  totalAmount: number;
  seats: string[];
  status: BookingStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  movie?: Movie;
  show?: Show;
}

export interface BookingRequest {
  showId: string;
  seatIds: string[];
}

export interface ConfirmBookingRequest {
  paymentMethod?: string;
  transactionId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
  };
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// UI State Types
export interface Loading {
  [key: string]: boolean;
}

export interface Filter {
  genre?: string;
  date?: string;
  minRating?: number;
  searchQuery?: string;
}
