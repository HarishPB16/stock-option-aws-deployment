import mongoose from 'mongoose';
import logger from '../utils/logger';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
    try {
        let mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/stock-options';

        // If local test without mongo, use memory server
        if (process.env.NODE_ENV !== 'production' && mongoURI.includes('localhost')) {
            const mongod = await MongoMemoryServer.create();
            mongoURI = mongod.getUri();
            logger.info(`Using mongodb-memory-server on ${mongoURI}`);
        }

        const conn = await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            retryWrites: true,
            w: 'majority',
            // DocumentDB SSL requirements typically injected here if in AWS
            // ssl: process.env.NODE_ENV === 'production',
            // sslCA: process.env.NODE_ENV === 'production' ? ['path-to-aws-rds-ca'] : undefined
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        logger.error(`Error Connecting to DB: ${error.message}`);
        process.exit(1);
    }
};
