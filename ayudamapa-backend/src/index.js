import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load environment variables FIRST before importing other modules
dotenv.config();

import pool from './db/pool.js';

// Import middleware
import { verifyJWT } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import pinsRoutes from './routes/pins.js';
import supplyRequestsRoutes from './routes/supply_requests.js';
import syncRoutes from './routes/sync.js';

// Initialize Express app
const app = express();

// Test database connection on startup
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('[DB_ERROR] Failed to connect to database:', err.message);
    process.exit(1);
  } else {
    console.log('[DB_SUCCESS] Connected to PostgreSQL database');
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies for refresh token handling

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/profile', verifyJWT, profileRoutes);
app.use('/api/pins', pinsRoutes);
app.use('/api/supply_requests', supplyRequestsRoutes);
app.use('/api/sync', syncRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
});

export default app;
