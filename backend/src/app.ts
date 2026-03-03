import express, { Application } from 'express';
import helmet from 'helmet';
import core from 'cors'; // we will use cors default alias
import hpp from 'hpp';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/requestLogger.middleware';
import indexRoutes from './routes/index';
// DB config to be built
// import connectDB from './config/db.config';

const app: Application = express();

// Security Middlewares
// 1. Helmet (secure headers)
app.use(helmet());

// 2. CORS restricted (update origin in production)
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['http://localhost', 'https://yourdomain.com'] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Express JSON body parser & size limit (10kb)
app.use(express.json({ limit: '10kb' }));

// 4. HPP (prevent parameter pollution)
app.use(hpp());

// Logging
app.use(requestLogger);

// Mount main API router
app.use('/api/v1', indexRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
