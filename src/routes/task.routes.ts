import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { create, list, getOne, update, remove } from '../controllers/task.controller';

const router = Router();

router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
