import { Router } from 'express';
import { searchAllContent, searchIndex, getAvailableIndices } from '../controllers/search.controller';

const router = Router();

router.get('/test', (_, res) => {
  res.json({ message: 'Search route working!' });
});

router.get('/', searchAllContent);
router.get('/indices', getAvailableIndices);
router.get('/:index', searchIndex);

export default router;
