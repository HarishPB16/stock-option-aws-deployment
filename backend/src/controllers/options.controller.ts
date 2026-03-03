import { Request, Response, NextFunction } from 'express';
import { generateOptionSuggestion } from '../services/gemini.service';
import { Option } from '../models/option.model';
import logger from '../utils/logger';

export const suggestOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticker } = req.body;
        // Assuming user identifier from an auth middleware (mocking for now since JWT isn't fully scaffolded)
        const userId = req.headers['x-user-id'] as string || 'anonymous';

        logger.info(`Processing Option Suggestion Request`, { userId, ticker });

        const insight = await generateOptionSuggestion(ticker);

        // Save strictly to DocumentDB, async off main thread but awaited for consistency here
        const newOption = new Option({
            userId,
            stock: ticker,
            action: insight.action,
            confidence: insight.confidence,
            risk: insight.risk,
            support: insight.support,
            resistance: insight.resistance,
            pe: insight.pe,
            trend: insight.trend
        });

        await newOption.save();

        res.status(200).json({
            success: true,
            data: {
                ticker,
                insight,
                recordId: newOption._id
            }
        });

    } catch (error) {
        next(error); // Pass to global error handler
    }
};
