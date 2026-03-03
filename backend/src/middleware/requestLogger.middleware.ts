import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Incoming Request', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            status: res.statusCode,
            durationMs: duration,
            userAgent: req.headers['user-agent']
        });
    });
    next();
};
