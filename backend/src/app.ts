import express, { Application } from 'express';
import helmet from 'helmet';
import core from 'cors'; // we will use cors default alias
import hpp from 'hpp';
import cors from 'cors';
import path from 'path';
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
const allowedOrigins = ['http://localhost', 'http://my-stock-option-app-frontend.s3-website.ap-south-1.amazonaws.com'];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// 3. Express JSON body parser & size limit (10kb)
app.use(express.json({ limit: '10kb' }));

// 4. HPP (prevent parameter pollution)
app.use(hpp());

// 5. Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Logging
app.use(requestLogger);

// Mount main API router
app.use('/api/v1', indexRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
