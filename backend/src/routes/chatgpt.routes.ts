import { Router } from 'express';
import { suggestOptionChatGPT, askOptionChatGPT, deleteOptionChatGPT, getHistoryByDateChatGPT, getMarketBriefingChatGPT } from '../controllers/chatgpt.controller';
import { optionRateLimiter } from '../middleware/rateLimit.middleware';
import { validateOptionRequest } from '../middleware/validation.middleware';

const router = Router();

// Endpoint: POST /api/v1/chatgpt/options/suggest
router.post('/options/suggest', optionRateLimiter, validateOptionRequest, suggestOptionChatGPT);

// Endpoint: GET /api/v1/chatgpt/options/history
router.get('/options/history', getHistoryByDateChatGPT);

// Endpoint: POST /api/v1/chatgpt/options/ask
router.post('/options/ask', optionRateLimiter, validateOptionRequest, askOptionChatGPT);

// Endpoint: GET /api/v1/chatgpt/market/briefing
router.get('/market/briefing', getMarketBriefingChatGPT);

// Endpoint: DELETE /api/v1/chatgpt/options/:ticker
router.delete('/options/:ticker', deleteOptionChatGPT);

export default router;
