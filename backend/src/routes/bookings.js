import express from 'express';
import { bookingController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public route - Get booking by reference (no authentication required)
router.get('/reference/:reference', bookingController.getBookingByReference);

// User routes - Book seats (requires authentication)
router.post('/', authMiddleware, bookingController.bookSeats);

// User routes - Confirm booking (requires authentication)
router.patch('/:id/confirm', authMiddleware, bookingController.confirmBooking);

// User routes - Get booking by ID (requires authentication)
router.get('/:id', authMiddleware, bookingController.getBooking);

// User routes - Get user bookings (requires authentication)
router.get('/user/:userId', authMiddleware, bookingController.getUserBookings);

export default router;
