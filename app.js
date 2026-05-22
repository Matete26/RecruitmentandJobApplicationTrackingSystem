import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';

dotenv.config();

const app = express();

// ====================== MIDDLEWARE ======================

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================== ROUTES ======================

// API Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ATS API is running successfully 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);

// ====================== ERROR HANDLING ======================

// 404 Not Found Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// ====================== SERVER SETUP ======================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 ATS Recruitment API Server Started`);
      console.log(`📍 Running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;

// Start the server (uncomment if running directly)
startServer();