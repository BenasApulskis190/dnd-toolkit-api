
import { Router } from 'express';
import { getMonsterTypes, getMonsterTypeById } from '../controllers/monterType.controller';

const router = Router();

router.get('/', getMonsterTypes);
router.get('/:id', getMonsterTypeById);

export default router;