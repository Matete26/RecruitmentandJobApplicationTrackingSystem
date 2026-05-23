import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';

// ❌ Remove dotenv import and dotenv.config() — handled in server.js

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);

app.use(notFound);
app.use(errorHandler);

// DB connection stays here so app.js remains self-contained for testing
connectDB();

export default app;