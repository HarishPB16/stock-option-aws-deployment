import { Router } from 'express';
import optionsRoutes from './options.routes';
import marketRoutes from './market.routes';

const router = Router();

// Mount modules
router.use('/options', optionsRoutes);
router.use('/market', marketRoutes);

// Healthcheck
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default router;
