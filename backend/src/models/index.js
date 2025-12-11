import pool from '../config/database.js';
import { retryAsync } from '../utils/helpers.js';

export const movieModel = {
  async createMovie(movieData) {
    const { title, description, genre, rating, duration_minutes, poster_url, release_date } = movieData;
    return retryAsync(async () => {
      const result = await pool.query(
        `INSERT INTO movies (title, description, genre, rating, duration_minutes, poster_url, release_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [title, description, genre, rating, duration_minutes, poster_url, release_date]
      );
      return result.rows[0];
    });
  },

  async getMovies(filters = {}) {
    return retryAsync(async () => {
      let query = 'SELECT * FROM movies WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (filters.genre) {
        query += ` AND genre ILIKE $${paramCount++}`;
        params.push(`%${filters.genre}%`);
      }

      if (filters.search) {
        query += ` AND title ILIKE $${paramCount++}`;
        params.push(`%${filters.search}%`);
      }

      query += ' ORDER BY release_date DESC, created_at DESC';

      const result = await pool.query(query, params);
      return result.rows;
    });
  },

  async getMovieById(id) {
    return retryAsync(async () => {
      const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
      return result.rows[0];
    });
  },

  async updateMovie(id, updateData) {
    const { title, description, genre, rating, duration_minutes, poster_url, release_date } = updateData;
    return retryAsync(async () => {
      const result = await pool.query(
        `UPDATE movies 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             genre = COALESCE($3, genre),
             rating = COALESCE($4, rating),
             duration_minutes = COALESCE($5, duration_minutes),
             poster_url = COALESCE($6, poster_url),
             release_date = COALESCE($7, release_date),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [title, description, genre, rating, duration_minutes, poster_url, release_date, id]
      );
      return result.rows[0];
    });
  },

  async deleteMovie(id) {
    return retryAsync(async () => {
      const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    });
  },
};

export const showModel = {
  async createShow(showData) {
    const { movie_id, show_date, show_time, screen_name, total_seats, price_standard, price_premium } = showData;
    return retryAsync(async () => {
      const result = await pool.query(
        `INSERT INTO shows (movie_id, show_date, show_time, screen_name, total_seats, available_seats, price_standard, price_premium)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [movie_id, show_date, show_time, screen_name, total_seats, total_seats, price_standard, price_premium]
      );
      return result.rows[0];
    });
  },

  async getShowsByMovieId(movieId) {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT * FROM shows WHERE movie_id = $1
         ORDER BY show_date, show_time`,
        [movieId]
      );
      return result.rows;
    });
  },

  async getShowById(id) {
    return retryAsync(async () => {
      const result = await pool.query('SELECT * FROM shows WHERE id = $1', [id]);
      return result.rows[0];
    });
  },

  async getUpcomingShows() {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT shows.*, movies.title, movies.genre, movies.poster_url
         FROM shows
         JOIN movies ON shows.movie_id = movies.id
         ORDER BY shows.show_date, shows.show_time`
      );
      return result.rows;
    });
  },

  async updateShow(id, updateData) {
    const { screen_name, price_standard, price_premium, available_seats } = updateData;
    return retryAsync(async () => {
      const result = await pool.query(
        `UPDATE shows 
         SET screen_name = COALESCE($1, screen_name),
             price_standard = COALESCE($2, price_standard),
             price_premium = COALESCE($3, price_premium),
             available_seats = COALESCE($4, available_seats),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [screen_name, price_standard, price_premium, available_seats, id]
      );
      return result.rows[0];
    });
  },
};

export const seatModel = {
  async createSeatsForShow(showId, totalSeats) {
    return retryAsync(async () => {
      const seats = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
      const seatsPerRow = Math.ceil(totalSeats / rows.length);

      for (let i = 0; i < rows.length && seats.length < totalSeats; i++) {
        for (let j = 1; j <= seatsPerRow && seats.length < totalSeats; j++) {
          const seatType = j <= seatsPerRow / 2 ? 'standard' : 'premium';
          seats.push([showId, rows[i], j, seatType]);
        }
      }

      const query = `
        INSERT INTO seats (show_id, seat_row, seat_number, seat_type)
        VALUES ${seats.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ')}
        RETURNING *
      `;

      const result = await pool.query(query, seats.flat());
      return result.rows;
    });
  },

  async getAvailableSeatsForShow(showId) {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT * FROM seats WHERE show_id = $1 AND is_booked = FALSE
         ORDER BY seat_row, seat_number`,
        [showId]
      );
      return result.rows;
    });
  },

  async getSeatsByIds(seatIds) {
    if (!seatIds || seatIds.length === 0) return [];
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT * FROM seats WHERE id = ANY($1)`,
        [seatIds]
      );
      return result.rows;
    });
  },

  async getSeatById(seatId) {
    return retryAsync(async () => {
      const result = await pool.query('SELECT * FROM seats WHERE id = $1', [seatId]);
      return result.rows[0];
    });
  },

  async getSeatsForShowByRow(showId) {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT * FROM seats WHERE show_id = $1 ORDER BY seat_row, seat_number`,
        [showId]
      );
      return result.rows;
    });
  },
};

export const bookingModel = {
  async createBooking(bookingData) {
    const { booking_reference, show_id, user_id, seat_ids, total_price, expires_at } = bookingData;
    return retryAsync(async () => {
      const result = await pool.query(
        `INSERT INTO bookings (booking_reference, show_id, user_id, seat_ids, total_price, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
         RETURNING *`,
        [booking_reference, show_id, user_id, seat_ids, total_price, expires_at]
      );
      return result.rows[0];
    });
  },

  async getBookingById(bookingId) {
    return retryAsync(async () => {
      const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      return result.rows[0];
    });
  },

  async getBookingByReference(reference) {
    return retryAsync(async () => {
      const result = await pool.query('SELECT * FROM bookings WHERE booking_reference = $1', [reference]);
      return result.rows[0];
    });
  },

  async getUserBookings(userId) {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT b.*, m.title as movie_title, sh.show_date, sh.show_time
         FROM bookings b
         JOIN shows sh ON b.show_id = sh.id
         JOIN movies m ON sh.movie_id = m.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );
      return result.rows;
    });
  },

  async updateBookingStatus(bookingId, status) {
    return retryAsync(async () => {
      const confirmedAt = status === 'CONFIRMED' ? new Date() : null;
      const result = await pool.query(
        `UPDATE bookings 
         SET status = $1, confirmed_at = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, confirmedAt, bookingId]
      );
      return result.rows[0];
    });
  },

  async getPendingExpiredBookings(expiryMinutes) {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT * FROM bookings 
         WHERE status = 'PENDING' AND expires_at < CURRENT_TIMESTAMP`,
      );
      return result.rows;
    });
  },
};

export const userModel = {
  async createUser(userData) {
    const { email, password_hash, first_name, last_name, phone, role = 'user' } = userData;
    return retryAsync(async () => {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, phone, role, created_at`,
        [email, password_hash, first_name, last_name, phone, role]
      );
      return result.rows[0];
    });
  },

  async getUserByEmail(email) {
    return retryAsync(async () => {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    });
  },

  async getUserById(id) {
    return retryAsync(async () => {
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, phone, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    });
  },

  async updateUser(id, updateData) {
    const { first_name, last_name, phone } = updateData;
    return retryAsync(async () => {
      const result = await pool.query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`,
        [first_name, last_name, phone, id]
      );
      return result.rows[0];
    });
  },

  async getUserBookings(userId) {
    return retryAsync(async () => {
      const result = await pool.query(
        `SELECT b.*, m.title as movie_title, sh.show_date, sh.show_time
         FROM bookings b
         JOIN shows sh ON b.show_id = sh.id
         JOIN movies m ON sh.movie_id = m.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );
      return result.rows;
    });
  },
};
