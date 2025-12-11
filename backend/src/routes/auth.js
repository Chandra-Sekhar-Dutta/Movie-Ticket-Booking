import express from 'express';
import { authController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/bookings', authMiddleware, authController.getMyBookings);

export default router;
