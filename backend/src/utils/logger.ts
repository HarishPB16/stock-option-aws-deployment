import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp(),
        json()
    ),
    defaultMeta: { service: 'stock-options-api' },
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'security.log'), level: 'warn' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;
