import express from 'express';
import { generatePrompt } from '../controllers/prompts.controller';
import { optionRateLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

// Apply rate limiter to prevent abuse
router.use(optionRateLimiter);

// @route   POST /api/v1/prompts/generate
// @desc    Generate a raw prompt based on type and input
// @access  Public (or semi-private)
router.post('/generate', generatePrompt);

export default router;
