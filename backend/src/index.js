import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware, requestLogger } from './middlewares/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { bookingService } from './services/index.js';
import { bookingExpiryService } from './services/bookingExpiry.js';
import pool from './config/database.js';

// Import routes
import movieRoutes from './routes/movies.js';
import showRoutes from './routes/shows.js';
import bookingRoutes from './routes/bookings.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection at startup
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Middlewares
app.use(express.json());
app.use(corsMiddleware);
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 BookMyShow Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('⚠️  Server running but database connection failed');
  }

  // Start booking expiry checker (checks every 30 seconds for expired bookings)
  bookingExpiryService.startExpiryChecker(30);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  bookingExpiryService.stopExpiryChecker();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
