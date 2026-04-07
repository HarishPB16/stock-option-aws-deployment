import { Router } from 'express';
import { getGames, addGame } from '../controllers/games.controller';

const router = Router();

router.get('/', getGames);
router.post('/', addGame);

export default router;
