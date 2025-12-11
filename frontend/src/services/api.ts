import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  Movie,
  Show,
  Booking,
  BookingRequest,
  CreateMovieRequest,
  CreateShowRequest,
  ConfirmBookingRequest,
  PaginatedResponse,
} from '../types';

// Transform snake_case from backend to camelCase for frontend
const transformSeat = (backendSeat: any): any => ({
  id: backendSeat.id,
  showId: backendSeat.show_id,
  seatNumber: backendSeat.seat_number?.toString() || backendSeat.id?.toString(),
  row: backendSeat.seat_row,
  column: backendSeat.seat_column,
  isBooked: backendSeat.is_booked,
  seatType: backendSeat.seat_type,
  bookedBy: backendSeat.booked_by,
});

const transformMovie = (backendMovie: any): Movie => ({
  id: backendMovie.id,
  title: backendMovie.title,
  description: backendMovie.description,
  genre: backendMovie.genre,
  duration: backendMovie.duration_minutes,
  releaseDate: backendMovie.release_date,
  posterUrl: backendMovie.poster_url,
  rating: backendMovie.rating,
  cast: backendMovie.cast,
  createdAt: backendMovie.created_at,
  updatedAt: backendMovie.updated_at,
});

const transformShow = (backendShow: any): Show => ({
  id: backendShow.id,
  movieId: backendShow.movie_id,
  showTime: backendShow.show_time,
  date: backendShow.show_date,
  totalSeats: backendShow.total_seats,
  availableSeats: backendShow.available_seats,
  standardPrice: backendShow.price_standard,
  premiumPrice: backendShow.price_premium,
  seats: backendShow.seats?.map(transformSeat),
  createdAt: backendShow.created_at,
  updatedAt: backendShow.updated_at,
});

const transformBooking = (backendBooking: any): Booking => ({
  id: backendBooking.id?.toString(),
  userId: backendBooking.user_id?.toString(),
  showId: backendBooking.show_id?.toString(),
  bookingReference: backendBooking.booking_reference,
  totalSeats: backendBooking.seat_ids?.length || 0,
  totalAmount: backendBooking.total_price || 0,
  seats: Array.isArray(backendBooking.seat_ids) ? backendBooking.seat_ids : [],
  status: backendBooking.status || 'PENDING',
  expiresAt: backendBooking.expires_at,
  createdAt: backendBooking.created_at,
  updatedAt: backendBooking.updated_at,
});

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.client.post<any>('/auth/signup', data);
    return {
      success: response.data.success,
      message: response.data.message || 'Signup successful',
      token: response.data.data?.token,
      user: response.data.data?.user,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<any>('/auth/login', data);
    return {
      success: response.data.success,
      message: response.data.message || 'Login successful',
      token: response.data.data?.token,
      user: response.data.data?.user,
    };
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  }

  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await this.client.get<ApiResponse<Booking[]>>('/auth/bookings');
    return response.data;
  }

  // Movie endpoints
  async createMovie(data: CreateMovieRequest): Promise<ApiResponse<Movie>> {
    const response = await this.client.post<ApiResponse<any>>('/movies', data);
    return {
      ...response.data,
      data: response.data.data ? transformMovie(response.data.data) : null,
    };
  }

  async getMovies(params?: Record<string, any>): Promise<ApiResponse<Movie[]>> {
    const response = await this.client.get<ApiResponse<any[]>>('/movies', { params });
    return {
      ...response.data,
      data: response.data.data?.map(transformMovie) || [],
    };
  }

  async getMovieById(id: string): Promise<ApiResponse<Movie>> {
    const response = await this.client.get<ApiResponse<any>>(`/movies/${id}`);
    return {
      ...response.data,
      data: response.data.data ? transformMovie(response.data.data) : null,
    };
  }

  async updateMovie(id: string, data: Partial<Movie>): Promise<ApiResponse<Movie>> {
    const response = await this.client.put<ApiResponse<any>>(`/movies/${id}`, data);
    return {
      ...response.data,
      data: response.data.data ? transformMovie(response.data.data) : null,
    };
  }

  async deleteMovie(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/movies/${id}`);
    return response.data;
  }

  // Show endpoints
  async createShow(data: CreateShowRequest): Promise<ApiResponse<Show>> {
    const response = await this.client.post<ApiResponse<any>>('/shows', data);
    return {
      ...response.data,
      data: response.data.data ? transformShow(response.data.data) : null,
    };
  }

  async getUpcomingShows(params?: Record<string, any>): Promise<ApiResponse<Show[]>> {
    const response = await this.client.get<ApiResponse<any[]>>('/shows/upcoming/list', { params });
    return {
      ...response.data,
      data: response.data.data?.map(transformShow) || [],
    };
  }

  async getShowsByMovieId(movieId: string): Promise<ApiResponse<Show[]>> {
    const response = await this.client.get<ApiResponse<any[]>>(`/shows/movie/${movieId}`);
    return {
      ...response.data,
      data: response.data.data?.map(transformShow) || [],
    };
  }

  async getShowWithSeats(id: string): Promise<ApiResponse<Show>> {
    const response = await this.client.get<ApiResponse<any>>(`/shows/${id}`);
    return {
      ...response.data,
      data: response.data.data ? transformShow(response.data.data) : null,
    };
  }

  async updateShow(id: string, data: Partial<Show>): Promise<ApiResponse<Show>> {
    const response = await this.client.put<ApiResponse<any>>(`/shows/${id}`, data);
    return {
      ...response.data,
      data: response.data.data ? transformShow(response.data.data) : null,
    };
  }

  async deleteShow(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/shows/${id}`);
    return response.data;
  }

  // Booking endpoints
  async bookSeats(data: BookingRequest): Promise<ApiResponse<Booking>> {
    const response = await this.client.post<ApiResponse<any>>('/bookings', data);
    return {
      ...response.data,
      data: transformBooking(response.data.data),
    };
  }

  async confirmBooking(id: string, data?: ConfirmBookingRequest): Promise<ApiResponse<Booking>> {
    const response = await this.client.patch<ApiResponse<any>>(
      `/bookings/${id}/confirm`,
      data
    );
    return {
      ...response.data,
      data: transformBooking(response.data.data),
    };
  }

  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    const response = await this.client.get<ApiResponse<any>>(`/bookings/${id}`);
    return {
      ...response.data,
      data: transformBooking(response.data.data),
    };
  }

  async getBookingByReference(reference: string): Promise<ApiResponse<Booking>> {
    const response = await this.client.get<ApiResponse<any>>(
      `/bookings/reference/${reference}`
    );
    return {
      ...response.data,
      data: transformBooking(response.data.data),
    };
  }

  async getUserBookings(userId: string): Promise<ApiResponse<Booking[]>> {
    const response = await this.client.get<ApiResponse<any>>(`/bookings/user/${userId}`);
    return {
      ...response.data,
      data: Array.isArray(response.data.data) 
        ? response.data.data.map(transformBooking)
        : [],
    };
  }
}

export const apiClient = new ApiClient();
