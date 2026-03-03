import { Router } from 'express';
import { suggestOption, askOption, deleteOption } from '../controllers/options.controller';
import { optionRateLimiter } from '../middleware/rateLimit.middleware';
import { validateOptionRequest } from '../middleware/validation.middleware';

const router = Router();

// Endpoint: POST /api/v1/options/suggest
// Rate limited and strictly validated
router.post('/suggest', optionRateLimiter, validateOptionRequest, suggestOption);

// Endpoint: POST /api/v1/options/ask
// Simple text generation with DB caching
router.post('/ask', optionRateLimiter, validateOptionRequest, askOption);

// Endpoint: DELETE /api/v1/options/:ticker
// Deletes historical db records for a particular ticker
router.delete('/:ticker', deleteOption);

export default router;
