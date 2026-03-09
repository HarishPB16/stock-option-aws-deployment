import { Router } from 'express';
import { suggestOptionClaude, askOptionClaude, deleteOptionClaude, getHistoryByDateClaude } from '../controllers/claude.controller';
import { optionRateLimiter } from '../middleware/rateLimit.middleware';
import { validateOptionRequest } from '../middleware/validation.middleware';

const router = Router();

// Endpoint: POST /api/v1/claude/options/suggest
router.post('/options/suggest', optionRateLimiter, validateOptionRequest, suggestOptionClaude);

// Endpoint: GET /api/v1/claude/options/history
router.get('/options/history', getHistoryByDateClaude);

// Endpoint: POST /api/v1/claude/options/ask
router.post('/options/ask', optionRateLimiter, validateOptionRequest, askOptionClaude);

// Endpoint: DELETE /api/v1/claude/options/:ticker
router.delete('/options/:ticker', deleteOptionClaude);

export default router;
