import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const validateOptionRequest = (req: Request, res: Response, next: NextFunction) => {
    const { ticker } = req.body;

    if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
        logger.warn('Validation Failure', { ip: req.ip, payload: ticker });
        return res.status(400).json({ success: false, error: { message: 'Ticker symbol is required and cannot be empty' } });
    }

    // Attach cleaned/verified parameter
    req.body.ticker = ticker.trim();
    next();
};
