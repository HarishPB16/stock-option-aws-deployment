import { Request, Response } from 'express';
import logger from '../utils/logger';
import { generateTopPicks } from '../services/gemini.service';
import { generateTopPicksChatGPT } from '../services/chatgpt.service';
import { generateTopPicksClaude } from '../services/claude.service';
import { generateTopPicksDeepSeek } from '../services/deepseek.service';
import { TopPicks } from '../models/top-picks.model';

// Helper to get today's date key
const getTodayDateKey = (): string => {
    return new Date().toISOString().split('T')[0];
};

export const getAvailableDates = async (req: Request, res: Response): Promise<void> => {
    try {
        const dates = await TopPicks.distinct('dateKey');
        // Sort newest first
        dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        res.status(200).json({ success: true, dates });
    } catch (error: any) {
        logger.error('Error fetching available dates', { error: error.message });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const getTopPicks = async (req: Request, res: Response): Promise<void> => {
    try {
        const aiService = req.query.ai as string;
        let dateKey = req.query.date as string;
        const today = getTodayDateKey();
        
        if (!dateKey) {
            dateKey = today;
        }

        // 1. Check MongoDB Cache First
        let existingRun = await TopPicks.findOne({ dateKey, aiService });
        if (existingRun) {
            logger.info('Returning cached Top Picks from MongoDB', { aiService, dateKey });
            res.status(200).json({ calls: existingRun.calls, puts: existingRun.puts });
            return;
        }

        // 2. If historical date requested but missing
        if (dateKey !== today) {
            res.status(404).json({ error: 'No historical data found for this specific date and AI.' });
            return;
        }

        // 3. Generate New Top Picks
        let result;
        switch (aiService) {
            case 'chatgpt': result = await generateTopPicksChatGPT(); break;
            case 'claude': result = await generateTopPicksClaude(); break;
            case 'deepseek': result = await generateTopPicksDeepSeek(); break;
            case 'gemini': default: result = await generateTopPicks(); break;
        }

        // 4. Save to Database
        if (result && result.calls && result.puts) {
            try {
                const newRecord = new TopPicks({
                    dateKey,
                    aiService: aiService || 'gemini',
                    calls: result.calls,
                    puts: result.puts
                });
                await newRecord.save();
                logger.info('Saved new Top Picks to MongoDB', { aiService, dateKey });
            } catch (dbError: any) {
                // If parallel calls caused a race condition and it already exists
                if (dbError.code === 11000) {
                     logger.warn('Top Picks already saved by another concurrent request', { aiService, dateKey });
                } else {
                     logger.error('Failed to save Top Picks to database', { error: dbError.message });
                }
            }
        }

        res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error fetching Top Picks', { error: error.message, ai: req.query.ai });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
