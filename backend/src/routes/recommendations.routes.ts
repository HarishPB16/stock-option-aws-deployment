import { Router } from 'express';
import { getTopPicks, getAvailableDates } from '../controllers/recommendations.controller';

const router = Router();

// Endpoint: GET /api/v1/recommendations/dates
router.get('/dates', getAvailableDates);

// Endpoint: GET /api/v1/recommendations/top-picks?ai=gemini&date=YYYY-MM-DD
router.get('/top-picks', getTopPicks);

export default router;
