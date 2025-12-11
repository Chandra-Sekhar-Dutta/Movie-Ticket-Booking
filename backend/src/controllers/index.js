import { movieService, showService, bookingService } from '../services/index.js';
import { authService } from '../services/auth.js';

export const movieController = {
  async createMovie(req, res, next) {
    try {
      const { title, description, genre, rating, duration_minutes, poster_url, release_date } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, error: { message: 'Title is required' } });
      }

      const movie = await movieService.createMovie({
        title,
        description,
        genre,
        rating,
        duration_minutes,
        poster_url,
        release_date,
      });

      res.status(201).json({ success: true, data: movie });
    } catch (error) {
      next(error);
    }
  },

  async getMovies(req, res, next) {
    try {
      const { genre, search } = req.query;
      const movies = await movieService.getAllMovies({ genre, search });
      res.json({ success: true, data: movies });
    } catch (error) {
      next(error);
    }
  },

  async getMovieById(req, res, next) {
    try {
      const { id } = req.params;
      const movie = await movieService.getMovieById(id);
      res.json({ success: true, data: movie });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async updateMovie(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, genre, rating, duration_minutes, poster_url, release_date } = req.body;

      const movie = await movieService.updateMovie(id, {
        title,
        description,
        genre,
        rating,
        duration_minutes,
        poster_url,
        release_date,
      });

      res.json({ success: true, data: movie });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async deleteMovie(req, res, next) {
    try {
      const { id } = req.params;
      await movieService.deleteMovie(id);
      res.json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },
};

export const showController = {
  async createShow(req, res, next) {
    try {
      const { movie_id, show_date, show_time, screen_name, total_seats, price_standard, price_premium } = req.body;

      if (!movie_id || !show_date || !show_time || !total_seats) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: movie_id, show_date, show_time, total_seats' },
        });
      }

      const show = await showService.createShow({
        movie_id,
        show_date,
        show_time,
        screen_name,
        total_seats,
        price_standard: price_standard || 150,
        price_premium: price_premium || 250,
      });

      res.status(201).json({ success: true, data: show });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async getShowsByMovieId(req, res, next) {
    try {
      const { movieId } = req.params;
      const shows = await showService.getShowsByMovieId(movieId);
      res.json({ success: true, data: shows });
    } catch (error) {
      if (error.message === 'Movie not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async getShowWithSeats(req, res, next) {
    try {
      const { id } = req.params;
      const show = await showService.getShowWithSeats(id);
      res.json({ success: true, data: show });
    } catch (error) {
      if (error.message === 'Show not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async getUpcomingShows(req, res, next) {
    try {
      const shows = await showService.getUpcomingShows();
      res.json({ success: true, data: shows });
    } catch (error) {
      next(error);
    }
  },

  async updateShow(req, res, next) {
    try {
      const { id } = req.params;
      const { show_date, show_time, screen_name, price_standard, price_premium } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Show ID is required' },
        });
      }

      const updateData = {};
      if (show_date) updateData.show_date = show_date;
      if (show_time) updateData.show_time = show_time;
      if (screen_name) updateData.screen_name = screen_name;
      if (price_standard) updateData.price_standard = price_standard;
      if (price_premium) updateData.price_premium = price_premium;

      const updatedShow = await showService.updateShow(id, updateData);
      res.json({ success: true, data: updatedShow });
    } catch (error) {
      if (error.message === 'Show not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },
};

export const bookingController = {
  async bookSeats(req, res, next) {
    try {
      const { showId, seatIds } = req.body;
      const userId = req.user.userId; // Get userId from authenticated user

      if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: showId, seatIds (array)' },
        });
      }

      const booking = await bookingService.bookSeats(userId, showId, seatIds);

      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      if (error.message.includes('already booked')) {
        return res.status(409).json({ success: false, error: { message: error.message } });
      }
      if (error.message === 'Show not found' || error.message === 'One or more seats not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async confirmBooking(req, res, next) {
    try {
      const { id } = req.params;

      const booking = await bookingService.confirmBooking(id);

      res.json({ success: true, data: booking, message: 'Booking confirmed successfully' });
    } catch (error) {
      if (error.message === 'Booking not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      if (error.message.includes('already')) {
        return res.status(400).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async getBooking(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      res.json({ success: true, data: booking });
    } catch (error) {
      if (error.message === 'Booking not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async getBookingByReference(req, res, next) {
    try {
      const { reference } = req.params;
      const booking = await bookingService.getBookingByReference(reference);
      res.json({ success: true, data: booking });
    } catch (error) {
      if (error.message === 'Booking not found') {
        return res.status(404).json({ success: false, error: { message: error.message } });
      }
      next(error);
    }
  },

  async getUserBookings(req, res, next) {
    try {
      const { userId } = req.params;
      const bookings = await bookingService.getUserBookings(userId);
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },
};

export const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;

      const result = await authService.signup({
        email,
        password,
        first_name,
        last_name,
        phone,
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: { message: error.message },
        });
      }
      if (error.message.includes('Invalid') || error.message.includes('must be')) {
        return res.status(400).json({
          success: false,
          error: { message: error.message },
        });
      }
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email and password are required' },
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          error: { message: error.message },
        });
      }
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { first_name, last_name, phone } = req.body;
      const user = await authService.updateProfile(req.user.userId, {
        first_name,
        last_name,
        phone,
      });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async getMyBookings(req, res, next) {
    try {
      const bookings = await authService.getUserBookings(req.user.userId);
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  },
};
