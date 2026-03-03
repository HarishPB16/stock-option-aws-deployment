import { Router } from 'express';
import { suggestOption } from '../controllers/options.controller';
import { optionRateLimiter } from '../middleware/rateLimit.middleware';
import { validateOptionRequest } from '../middleware/validation.middleware';

const router = Router();

// Endpoint: POST /api/v1/options/suggest
// Rate limited and strictly validated
router.post('/suggest', optionRateLimiter, validateOptionRequest, suggestOption);

export default router;
