import { Router } from 'express';
import optionsRoutes from './options.routes';
import marketRoutes from './market.routes';
import chatgptRoutes from './chatgpt.routes';
import claudeRoutes from './claude.routes';
import deepseekRoutes from './deepseek.routes';
import promptsRoutes from './prompts.routes';

const router = Router();

// Mount modules
router.use('/options', optionsRoutes);
router.use('/market', marketRoutes);
router.use('/chatgpt', chatgptRoutes);
router.use('/claude', claudeRoutes);
router.use('/deepseek', deepseekRoutes);
router.use('/prompts', promptsRoutes);

// Healthcheck
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default router;
