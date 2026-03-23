import { Router } from 'express';
import { getTopPicks } from '../controllers/recommendations.controller';

const router = Router();

// Endpoint: GET /api/v1/recommendations/top-picks?ai=gemini
router.get('/top-picks', getTopPicks);

export default router;
