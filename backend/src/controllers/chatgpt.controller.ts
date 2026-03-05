import { Request, Response, NextFunction } from 'express';
import { generateOptionSuggestionChatGPT, generateSimpleAdviceChatGPT, generateMarketBriefingChatGPT } from '../services/chatgpt.service';
import { OptionChatGPT } from '../models/chatgpt-option.model';
import { AdviceChatGPT } from '../models/chatgpt-advice.model';
import { MarketBriefingChatGPT } from '../models/chatgpt-market-briefing.model';
import logger from '../utils/logger';

export const suggestOptionChatGPT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticker } = req.body;
        const userId = req.headers['x-user-id'] as string || 'anonymous';

        logger.info(`Processing Option Suggestion Request (ChatGPT)`, { userId, ticker });

        const insight = await generateOptionSuggestionChatGPT(ticker);

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

        const savedOption = await OptionChatGPT.findOneAndUpdate(
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

export const askOptionChatGPT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticker } = req.body;
        const dateKey = new Date().toISOString().split('T')[0];

        const existingAdvice = await AdviceChatGPT.findOne({ stock: ticker, dateKey });

        if (existingAdvice) {
            logger.info(`Returning cached advice (ChatGPT) for`, { ticker, dateKey });
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

        logger.info(`Generating new simple advice (ChatGPT)`, { ticker });
        const newAdviceText = await generateSimpleAdviceChatGPT(ticker);

        const newAdviceRecord = new AdviceChatGPT({
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

export const getMarketBriefingChatGPT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dateKey = new Date().toISOString().split('T')[0];

        const existingBriefing = await MarketBriefingChatGPT.findOne({ dateKey });

        if (existingBriefing) {
            logger.info('Returning cached market briefing (ChatGPT)', { dateKey });
            return res.status(200).json({
                success: true,
                cached: true,
                data: {
                    date: dateKey,
                    briefing: existingBriefing.htmlContent
                }
            });
        }

        logger.info('Generating new market briefing (ChatGPT)');
        const newBriefingHTML = await generateMarketBriefingChatGPT();

        const newBriefingRecord = new MarketBriefingChatGPT({
            dateKey,
            htmlContent: newBriefingHTML
        });

        await newBriefingRecord.save();

        res.status(200).json({
            success: true,
            cached: false,
            data: {
                date: dateKey,
                briefing: newBriefingHTML
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteOptionChatGPT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const titleCaseTicker = (req.params.ticker as string).trim().toUpperCase();

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);
        const dateKey = todayStart.toISOString().split('T')[0];

        logger.info(`Deleting ONLY Today's Database Records for (ChatGPT)`, { ticker: titleCaseTicker, dateKey });

        const optionDeletes = OptionChatGPT.deleteMany({
            stock: titleCaseTicker,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        const adviceDeletes = AdviceChatGPT.deleteMany({
            stock: titleCaseTicker,
            dateKey: dateKey
        });

        const [optionRes, adviceRes] = await Promise.all([optionDeletes, adviceDeletes]);

        res.status(200).json({
            success: true,
            data: {
                message: `Deleted ${optionRes.deletedCount} Option records and ${adviceRes.deletedCount} Advice records for ${titleCaseTicker} (ChatGPT)`,
                deletedOptions: optionRes.deletedCount,
                deletedAdvice: adviceRes.deletedCount
            }
        });

    } catch (error) {
        logger.error(`Error deleting records (ChatGPT)`, { error });
        next(error);
    }
};

export const getHistoryByDateChatGPT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;

        if (!date || typeof date !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, error: { message: 'Valid date query parameter required (YYYY-MM-DD)' } });
        }

        logger.info(`Fetching historical records for date (ChatGPT)`, { date });

        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0);
        const targetEnd = new Date(date);
        targetEnd.setUTCHours(23, 59, 59, 999);

        const [options, adviceRecords] = await Promise.all([
            OptionChatGPT.find({ createdAt: { $gte: targetDate, $lte: targetEnd } }).sort({ createdAt: -1 }),
            AdviceChatGPT.find({ dateKey: date }).sort({ createdAt: -1 })
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
        logger.error(`Error fetching history (ChatGPT)`, { error });
        next(error);
    }
};
