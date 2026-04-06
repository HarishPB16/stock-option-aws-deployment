import { Router } from 'express';
import { getCategories, saveCategories } from '../controllers/category.controller';

const router = Router();

router.get('/', getCategories);
router.post('/save', saveCategories);

export default router;
