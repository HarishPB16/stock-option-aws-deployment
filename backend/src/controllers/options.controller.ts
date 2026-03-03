import { Request, Response, NextFunction } from 'express';
import { generateOptionSuggestion, generateSimpleAdvice } from '../services/gemini.service';
import { Option } from '../models/option.model';
import { Advice } from '../models/advice.model';
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
            industryPe: insight.industryPe,
            averagePe5Yr: insight.averagePe5Yr,
            forecast1Year: insight.forecast1Year,
            tomorrowRange: insight.tomorrowRange,
            emaAnalysis: insight.emaAnalysis,
            rsiAnalysis: insight.rsiAnalysis,
            vixThetaAnalysis: insight.vixThetaAnalysis,
            supportResistanceAnalysis: insight.supportResistanceAnalysis,
            verdict: insight.verdict,
            trend: insight.trend,
            newsSummary: insight.newsSummary,
            analysis: insight.analysis
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

export const askOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticker } = req.body;

        // Generate today's date key (YYYY-MM-DD)
        const dateKey = new Date().toISOString().split('T')[0];

        // Check DB for existing query today
        const existingAdvice = await Advice.findOne({ stock: ticker, dateKey });

        if (existingAdvice) {
            logger.info(`Returning cached advice for`, { ticker, dateKey });
            return res.status(200).json({
                success: true,
                cached: true,
                data: {
                    ticker,
                    advice: existingAdvice.advice,
                    date: dateKey
                }
            });
        }

        logger.info(`Generating new simple advice`, { ticker });
        const newAdviceText = await generateSimpleAdvice(ticker);

        const newAdviceRecord = new Advice({
            stock: ticker,
            advice: newAdviceText,
            dateKey
        });

        await newAdviceRecord.save();

        res.status(200).json({
            success: true,
            cached: false,
            data: {
                ticker,
                advice: newAdviceText,
                date: dateKey
            }
        });

    } catch (error) {
        next(error);
    }
};

export const deleteOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const titleCaseTicker = req.params.ticker.trim().toUpperCase();

        // Exact UTC boundaries for "Today"
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);
        const dateKey = todayStart.toISOString().split('T')[0];

        logger.info(`Deleting ONLY Today's Database Records for`, { ticker: titleCaseTicker, dateKey });

        // Delete ONLY documents matching today's bounds
        const optionDeletes = Option.deleteMany({
            stock: titleCaseTicker,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        const adviceDeletes = Advice.deleteMany({
            stock: titleCaseTicker,
            dateKey: dateKey
        });

        const [optionRes, adviceRes] = await Promise.all([optionDeletes, adviceDeletes]);

        res.status(200).json({
            success: true,
            data: {
                message: `Deleted ${optionRes.deletedCount} Option records and ${adviceRes.deletedCount} Advice records for ${titleCaseTicker}`,
                deletedOptions: optionRes.deletedCount,
                deletedAdvice: adviceRes.deletedCount
            }
        });

    } catch (error) {
        logger.error(`Error deleting records`, { error });
        next(error);
    }
};

export const getHistoryByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;

        if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, error: { message: 'Valid date query parameter required (YYYY-MM-DD)' } });
        }

        logger.info(`Fetching historical records for date`, { date });

        // Build exact UTC bounds for the queried date
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0);
        const targetEnd = new Date(date);
        targetEnd.setUTCHours(23, 59, 59, 999);

        // Fetch concurrently
        const [options, adviceRecords] = await Promise.all([
            Option.find({ createdAt: { $gte: targetDate, $lte: targetEnd } }).sort({ createdAt: -1 }),
            Advice.find({ dateKey: date }).sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            data: {
                date,
                options,
                advice: adviceRecords
            }
        });

    } catch (error) {
        logger.error(`Error fetching history`, { error });
        next(error);
    }
};
