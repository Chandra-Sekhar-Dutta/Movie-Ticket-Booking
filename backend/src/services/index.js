import pool from '../config/database.js';
import { movieModel, showModel, seatModel, bookingModel } from '../models/index.js';
import { generateBookingReference, addMinutes, calculateSeatPrice } from '../utils/helpers.js';

export const movieService = {
  async createMovie(movieData) {
    return await movieModel.createMovie(movieData);
  },

  async getAllMovies(filters) {
    return await movieModel.getMovies(filters);
  },

  async getMovieById(id) {
    const movie = await movieModel.getMovieById(id);
    if (!movie) throw new Error('Movie not found');
    return movie;
  },

  async updateMovie(id, updateData) {
    const movie = await movieModel.getMovieById(id);
    if (!movie) throw new Error('Movie not found');
    return await movieModel.updateMovie(id, updateData);
  },

  async deleteMovie(id) {
    const movie = await movieModel.getMovieById(id);
    if (!movie) throw new Error('Movie not found');
    return await movieModel.deleteMovie(id);
  },
};

export const showService = {
  async createShow(showData) {
    const movie = await movieModel.getMovieById(showData.movie_id);
    if (!movie) throw new Error('Movie not found');

    const show = await showModel.createShow(showData);
    
    // Create seats for the show
    await seatModel.createSeatsForShow(show.id, show.total_seats);
    
    return show;
  },

  async getShowsByMovieId(movieId) {
    const movie = await movieModel.getMovieById(movieId);
    if (!movie) throw new Error('Movie not found');
    return await showModel.getShowsByMovieId(movieId);
  },

  async getShowById(id) {
    const show = await showModel.getShowById(id);
    if (!show) throw new Error('Show not found');
    return show;
  },

  async getUpcomingShows() {
    return await showModel.getUpcomingShows();
  },

  async getShowWithSeats(showId) {
    const show = await showModel.getShowById(showId);
    if (!show) throw new Error('Show not found');

    const seats = await seatModel.getSeatsForShowByRow(showId);
    
    return {
      ...show,
      seats: seats,
      availableSeatsCount: seats.filter(s => !s.is_booked).length,
    };
  },

  async updateShow(showId, updateData) {
    const show = await showModel.getShowById(showId);
    if (!show) throw new Error('Show not found');

    const updatedShow = await showModel.updateShow(showId, updateData);
    return updatedShow;
  },
};

export const bookingService = {
  async bookSeats(userId, showId, seatIds) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Lock the show for update
      const showResult = await client.query(
        'SELECT * FROM shows WHERE id = $1 FOR UPDATE',
        [showId]
      );

      if (showResult.rows.length === 0) {
        throw new Error('Show not found');
      }

      const show = showResult.rows[0];

      // Get seats with lock
      const seatsResult = await client.query(
        'SELECT * FROM seats WHERE id = ANY($1) FOR UPDATE',
        [seatIds]
      );

      const seats = seatsResult.rows;

      // Validate all seats exist
      if (seats.length !== seatIds.length) {
        throw new Error('One or more seats not found');
      }

      // Check if any seat is already booked
      if (seats.some(seat => seat.is_booked)) {
        throw new Error('One or more seats are already booked');
      }

      // Calculate total price
      let totalPrice = 0;
      seats.forEach(seat => {
        const price = calculateSeatPrice(seat.seat_type, show.price_standard, show.price_premium);
        totalPrice += typeof price === 'number' ? price : parseFloat(price) || 0;
      });
      // Ensure totalPrice is a valid number
      totalPrice = typeof totalPrice === 'number' && totalPrice > 0 ? totalPrice : 0;

      // Create booking
      const bookingReference = generateBookingReference();
      const expiresAt = addMinutes(new Date(), parseInt(process.env.BOOKING_EXPIRY_MINUTES || 2));

      const bookingResult = await client.query(
        `INSERT INTO bookings (booking_reference, show_id, user_id, seat_ids, total_price, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
         RETURNING *`,
        [bookingReference, showId, userId, seatIds, totalPrice, expiresAt]
      );

      const booking = bookingResult.rows[0];

      // Update seats as booked
      await client.query(
        'UPDATE seats SET is_booked = TRUE, booking_id = $1 WHERE id = ANY($2)',
        [booking.id, seatIds]
      );

      // Update available seats count
      await client.query(
        'UPDATE shows SET available_seats = available_seats - $1 WHERE id = $2',
        [seatIds.length, showId]
      );

      await client.query('COMMIT');

      return booking;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async confirmBooking(bookingId) {
    const booking = await bookingModel.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is already ' + booking.status);
    }

    return await bookingModel.updateBookingStatus(bookingId, 'CONFIRMED');
  },

  async getBookingById(bookingId) {
    const booking = await bookingModel.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },

  async getBookingByReference(reference) {
    const booking = await bookingModel.getBookingByReference(reference);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },

  async getUserBookings(userId) {
    return await bookingModel.getUserBookings(userId);
  },

  async releaseExpiredBookings() {
    const expiredBookings = await bookingModel.getPendingExpiredBookings(2);

    for (const booking of expiredBookings) {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Mark booking as failed
        await client.query(
          'UPDATE bookings SET status = $1 WHERE id = $2',
          ['FAILED', booking.id]
        );

        // Release seats
        await client.query(
          'UPDATE seats SET is_booked = FALSE, booking_id = NULL WHERE id = ANY($1)',
          [booking.seat_ids]
        );

        // Update available seats count
        await client.query(
          'UPDATE shows SET available_seats = available_seats + $1 WHERE id = $2',
          [booking.seat_ids.length, booking.show_id]
        );

        await client.query('COMMIT');
        console.log(`Released expired booking: ${booking.booking_reference}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error releasing booking ${booking.id}:`, error);
      } finally {
        client.release();
      }
    }
  },
};
