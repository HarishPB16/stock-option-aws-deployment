import { Request, Response } from 'express';
import logger from '../utils/logger';
import { generateTopPicks } from '../services/gemini.service';
import { generateTopPicksChatGPT } from '../services/chatgpt.service';
import { generateTopPicksClaude } from '../services/claude.service';
import { generateTopPicksDeepSeek } from '../services/deepseek.service';

export const getTopPicks = async (req: Request, res: Response): Promise<void> => {
    try {
        const aiService = req.query.ai as string;

        let result;
        switch (aiService) {
            case 'chatgpt':
                result = await generateTopPicksChatGPT();
                break;
            case 'claude':
                result = await generateTopPicksClaude();
                break;
            case 'deepseek':
                result = await generateTopPicksDeepSeek();
                break;
            case 'gemini':
            default:
                result = await generateTopPicks();
                break;
        }

        res.status(200).json(result);
    } catch (error: any) {
        logger.error('Error fetching Top Picks', { error: error.message, ai: req.query.ai });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
