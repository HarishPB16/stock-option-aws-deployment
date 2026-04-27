import { Router } from 'express';
import { getTradeSetup } from '../controllers/trade.controller';

const router = Router();

// Endpoint: POST /api/v1/trade/setup
router.post('/setup', getTradeSetup);

export default router;
