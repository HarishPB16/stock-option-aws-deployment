import { Router } from 'express';
import { getDailyBriefing, refreshDailyBriefing } from '../controllers/market.controller';

const router = Router();

// GET /api/v1/market/briefing
router.get('/briefing', getDailyBriefing);

// POST /api/v1/market/briefing/refresh
router.post('/briefing/refresh', refreshDailyBriefing);

export default router;
