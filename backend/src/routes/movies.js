import express from 'express';
import { movieController } from '../controllers/index.js';
import { adminAuthMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Admin routes - Create movie
router.post('/', adminAuthMiddleware, movieController.createMovie);

// User routes - Get all movies
router.get('/', movieController.getMovies);

// User routes - Get movie by ID
router.get('/:id', movieController.getMovieById);

// Admin routes - Update movie
router.put('/:id', adminAuthMiddleware, movieController.updateMovie);

// Admin routes - Delete movie
router.delete('/:id', adminAuthMiddleware, movieController.deleteMovie);

export default router;
