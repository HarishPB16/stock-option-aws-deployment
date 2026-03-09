import { Request, Response, NextFunction } from 'express';
import { generateOptionSuggestionClaude, generateSimpleAdviceClaude, generateMarketBriefingClaude } from '../services/claude.service';
import { OptionClaude } from '../models/claude-option.model';
import { AdviceClaude } from '../models/claude-advice.model';
import logger from '../utils/logger';

export const suggestOptionClaude = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticker } = req.body;
        const userId = req.headers['x-user-id'] as string || 'anonymous';

        logger.info(`Processing Option Suggestion Request (Claude)`, { userId, ticker });

        const insight = await generateOptionSuggestionClaude(ticker);

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);

        const optionData = {
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
        };

        const savedOption = await OptionClaude.findOneAndUpdate(
            {
                stock: ticker,
                createdAt: { $gte: todayStart, $lte: todayEnd }
            },
            { $set: optionData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            data: {
                ticker,
                insight,
                recordId: savedOption?._id
            }
        });

    } catch (error) {
        next(error);
    }
};

export const askOptionClaude = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticker } = req.body;
        const dateKey = new Date().toISOString().split('T')[0];

        const existingAdvice = await AdviceClaude.findOne({ stock: ticker, dateKey });

        if (existingAdvice) {
            logger.info(`Returning cached advice (Claude) for`, { ticker, dateKey });
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

        logger.info(`Generating new simple advice (Claude)`, { ticker });
        const newAdviceText = await generateSimpleAdviceClaude(ticker);

        const newAdviceRecord = new AdviceClaude({
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

export const deleteOptionClaude = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const titleCaseTicker = (req.params.ticker as string).trim().toUpperCase();

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);
        const dateKey = todayStart.toISOString().split('T')[0];

        logger.info(`Deleting ONLY Today's Database Records for (Claude)`, { ticker: titleCaseTicker, dateKey });

        const optionDeletes = OptionClaude.deleteMany({
            stock: titleCaseTicker,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        const adviceDeletes = AdviceClaude.deleteMany({
            stock: titleCaseTicker,
            dateKey: dateKey
        });

        const [optionRes, adviceRes] = await Promise.all([optionDeletes, adviceDeletes]);

        res.status(200).json({
            success: true,
            data: {
                message: `Deleted ${optionRes.deletedCount} Option records and ${adviceRes.deletedCount} Advice records for ${titleCaseTicker} (Claude)`,
                deletedOptions: optionRes.deletedCount,
                deletedAdvice: adviceRes.deletedCount
            }
        });

    } catch (error) {
        logger.error(`Error deleting records (Claude)`, { error });
        next(error);
    }
};

export const getHistoryByDateClaude = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;

        if (!date || typeof date !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, error: { message: 'Valid date query parameter required (YYYY-MM-DD)' } });
        }

        logger.info(`Fetching historical records for date (Claude)`, { date });

        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0);
        const targetEnd = new Date(date);
        targetEnd.setUTCHours(23, 59, 59, 999);

        const [options, adviceRecords] = await Promise.all([
            OptionClaude.find({ createdAt: { $gte: targetDate, $lte: targetEnd } }).sort({ createdAt: -1 }),
            AdviceClaude.find({ dateKey: date }).sort({ createdAt: -1 })
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
        logger.error(`Error fetching history (Claude)`, { error });
        next(error);
    }
};
