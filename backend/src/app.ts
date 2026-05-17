import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandler';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'ok', data: { timestamp: new Date().toISOString() } });
});

// API Routes
app.use('/api', router);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

export default app;