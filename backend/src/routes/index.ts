import { Router } from 'express';
import optionsRoutes from './options.routes';
import marketRoutes from './market.routes';
import chatgptRoutes from './chatgpt.routes';
import claudeRoutes from './claude.routes';
import deepseekRoutes from './deepseek.routes';
import promptsRoutes from './prompts.routes';
import recommendationsRoutes from './recommendations.routes';
import videoRoutes from './video.routes';
import categoryRoutes from './category.routes';

const router = Router();

// Mount modules
router.use('/options', optionsRoutes);
router.use('/market', marketRoutes);
router.use('/chatgpt', chatgptRoutes);
router.use('/claude', claudeRoutes);
router.use('/deepseek', deepseekRoutes);
router.use('/prompts', promptsRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/videos', videoRoutes);
router.use('/category', categoryRoutes);

// Healthcheck
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default router;
