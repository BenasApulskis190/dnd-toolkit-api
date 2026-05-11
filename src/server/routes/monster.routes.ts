import { Router } from 'express';
import { getMonsters, getMonsterById, getMonsterStats } from '../controllers/monster.controller';

const router = Router();

router.get('/', getMonsters);
router.get('/stats', getMonsterStats);
router.get('/:id', getMonsterById);

export default router;
