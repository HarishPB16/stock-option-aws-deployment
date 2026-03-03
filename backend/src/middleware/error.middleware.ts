import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled Error', {
        message: err.message,
        stack: err.stack,
        ip: req.ip,
        url: req.url
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message
        }
    });
};
