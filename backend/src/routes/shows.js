import express from 'express';
import { showController } from '../controllers/index.js';
import { adminAuthMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Admin routes - Create show
router.post('/', adminAuthMiddleware, showController.createShow);

// Admin routes - Update show
router.put('/:id', adminAuthMiddleware, showController.updateShow);

// User routes - Get upcoming shows
router.get('/upcoming/list', showController.getUpcomingShows);

// User routes - Get shows by movie ID
router.get('/movie/:movieId', showController.getShowsByMovieId);

// User routes - Get show with seats
router.get('/:id', showController.getShowWithSeats);

export default router;
