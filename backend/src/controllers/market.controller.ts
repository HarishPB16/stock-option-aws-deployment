import { Request, Response, NextFunction } from 'express';
import { MarketBriefing } from '../models/market-briefing.model';
import { generateMarketBriefing } from '../services/gemini.service';
import logger from '../utils/logger';

// Helper to get today's date key (YYYY-MM-DD in IST/Local)
const getTodayDateKey = (): string => {
    // We'll use UTC ISO string but adjust to make sure it represents "today" cleanly
    return new Date().toISOString().split('T')[0];
};

export const getDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dateKey = getTodayDateKey();

        let briefing = await MarketBriefing.findOne({ dateKey });

        if (!briefing) {
            logger.info('No market briefing found for today, generating new one...');
            const htmlContent = await generateMarketBriefing();

            briefing = new MarketBriefing({
                dateKey,
                htmlContent
            });
            await briefing.save();
        } else {
            logger.info('Returning cached market briefing for today');
        }

        res.status(200).json({
            success: true,
            data: {
                dateKey: briefing.dateKey,
                htmlContent: briefing.htmlContent,
                createdAt: briefing.createdAt
            }
        });

    } catch (error) {
        next(error);
    }
};

export const refreshDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dateKey = getTodayDateKey();
        logger.info('Force refreshing market briefing for today...');

        const htmlContent = await generateMarketBriefing();

        const updatedBriefing = await MarketBriefing.findOneAndUpdate(
            { dateKey },
            { $set: { htmlContent } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            data: {
                dateKey: updatedBriefing.dateKey,
                htmlContent: updatedBriefing.htmlContent,
                createdAt: (updatedBriefing as any).createdAt || new Date()
            }
        });

    } catch (error) {
        next(error);
    }
};
