import { Router } from 'express';
import { addVideo, getRandomVideos } from '../controllers/video.controller';

const router = Router();

// POST /api/v1/videos -> Add new video
router.post('/', addVideo);

// GET /api/v1/videos/random -> Get random videos
router.get('/random', getRandomVideos);

export default router;
