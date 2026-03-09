import { Router } from 'express';
import { suggestOptionDeepSeek, askOptionDeepSeek, deleteOptionDeepSeek, getHistoryByDateDeepSeek } from '../controllers/deepseek.controller';
import { optionRateLimiter } from '../middleware/rateLimit.middleware';
import { validateOptionRequest } from '../middleware/validation.middleware';

const router = Router();

// Endpoint: POST /api/v1/deepseek/options/suggest
router.post('/options/suggest', optionRateLimiter, validateOptionRequest, suggestOptionDeepSeek);

// Endpoint: GET /api/v1/deepseek/options/history
router.get('/options/history', getHistoryByDateDeepSeek);

// Endpoint: POST /api/v1/deepseek/options/ask
router.post('/options/ask', optionRateLimiter, validateOptionRequest, askOptionDeepSeek);

// Endpoint: DELETE /api/v1/deepseek/options/:ticker
router.delete('/options/:ticker', deleteOptionDeepSeek);

export default router;
