import pool from '../config/database.js';

/**
 * Booking Expiry Service
 * Automatically marks PENDING bookings as FAILED if they haven't been confirmed
 * within the specified expiry time (default: 2 minutes)
 */

const BOOKING_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds

export const bookingExpiryService = {
  /**
   * Check and expire pending bookings that have exceeded the time limit
   * This should be called periodically (e.g., every 30 seconds)
   */
  async expirePendingBookings() {
    try {
      const client = await pool.connect();

      // Calculate the expiry cutoff time (2 minutes ago)
      const expiryTime = new Date(Date.now() - BOOKING_EXPIRY_TIME);

      // Find all PENDING bookings created before the expiry time
      const result = await client.query(
        `SELECT id, booking_reference, seat_ids FROM bookings 
         WHERE status = 'PENDING' 
         AND created_at < $1`,
        [expiryTime]
      );

      const expiredBookings = result.rows;

      if (expiredBookings.length > 0) {
        console.log(
          `⏰ Found ${expiredBookings.length} booking(s) to expire at ${new Date().toISOString()}`
        );

        // Mark all expired bookings as FAILED
        for (const booking of expiredBookings) {
          try {
            // Start transaction
            await client.query('BEGIN');

            // Update booking status to FAILED
            await client.query(
              `UPDATE bookings SET status = 'FAILED' WHERE id = $1`,
              [booking.id]
            );

            // Release the seats (mark as not booked)
            const seatIds = booking.seat_ids || [];
            if (seatIds.length > 0) {
              await client.query(
                `UPDATE seats 
                 SET is_booked = false, booking_id = NULL 
                 WHERE id = ANY($1)`,
                [seatIds]
              );

              // Update show available seats
              await client.query(
                `UPDATE shows 
                 SET available_seats = available_seats + $1 
                 WHERE id IN (SELECT show_id FROM seats WHERE id = ANY($2))`,
                [seatIds.length, seatIds]
              );
            }

            // Commit transaction
            await client.query('COMMIT');

            console.log(
              `✓ Expired booking: ${booking.booking_reference} (ID: ${booking.id})`
            );
          } catch (error) {
            await client.query('ROLLBACK');
            console.error(
              `✗ Error expiring booking ${booking.booking_reference}:`,
              error.message
            );
          }
        }
      }

      client.release();
    } catch (error) {
      console.error('Error in bookingExpiryService:', error.message);
    }
  },

  /**
   * Start the periodic booking expiry checker
   * Runs every 30 seconds to check for expired bookings
   */
  startExpiryChecker(intervalSeconds = 30) {
    console.log(
      `🕐 Starting booking expiry checker (interval: ${intervalSeconds}s, expiry time: 2 minutes)`
    );

    // Run immediately on start
    this.expirePendingBookings();

    // Then run periodically
    setInterval(() => {
      this.expirePendingBookings();
    }, intervalSeconds * 1000);
  },

  /**
   * Stop the expiry checker (useful for testing or graceful shutdown)
   */
  stopExpiryChecker() {
    console.log('⏹️ Stopping booking expiry checker');
  },
};

export default bookingExpiryService;
