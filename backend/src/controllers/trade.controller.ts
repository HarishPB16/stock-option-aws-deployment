import { Request, Response, NextFunction } from 'express';
import { generateTradeSetup } from '../services/gemini.service';
import { generateTradeSetupChatGPT } from '../services/chatgpt.service';
import { generateTradeSetupClaude } from '../services/claude.service';
import logger from '../utils/logger';

export const getTradeSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { indexName, aiService } = req.body;

        if (!indexName) {
            return res.status(400).json({ success: false, error: { message: 'indexName is required (e.g. Nifty 50)' } });
        }

        logger.info(`Processing Trade Setup Request`, { indexName, aiService });

        let setupHtml = '';

        if (aiService === 'chatgpt') {
            setupHtml = await generateTradeSetupChatGPT(indexName);
        } else if (aiService === 'claude') {
            setupHtml = await generateTradeSetupClaude(indexName);
        } else {
            // Default to Gemini
            setupHtml = await generateTradeSetup(indexName);
        }

        res.status(200).json({
            success: true,
            data: {
                indexName,
                aiService: aiService || 'gemini',
                setupHtml
            }
        });

    } catch (error) {
        logger.error('Error generating trade setup', { error });
        next(error);
    }
};
