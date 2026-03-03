import setRateLimit from 'express-rate-limit';
import logger from '../utils/logger';

// 2-Layer Rate Limiting conceptually (in backend logic we enforce standard burst limits)
// Simulating an API Gateway backup
export const optionRateLimiter = setRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: { message: 'Too many requests from this IP, please try again after 15 minutes' }
    },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
            url: req.url,
            ip: req.ip
        });
        res.status(options.statusCode).send(options.message);
    }
});
