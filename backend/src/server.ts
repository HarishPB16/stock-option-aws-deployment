import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './config/db.config';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
        });
        await connectDB();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
