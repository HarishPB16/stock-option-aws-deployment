import { Router } from 'express';
import optionsRoutes from './options.routes';

const router = Router();

// Mount modules
router.use('/options', optionsRoutes);

// Healthcheck
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default router;
