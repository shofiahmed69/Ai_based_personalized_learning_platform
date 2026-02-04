import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import * as memoryController from '../controllers/memory.controller';

const router = Router();
router.use(authMiddleware);

const memoryTypes = ['preference', 'context', 'interest', 'correction', 'fact'];

router.post(
  '/',
  validate([
    body('type').isIn(memoryTypes).withMessage('Invalid memory type'),
    body('key').trim().notEmpty().withMessage('Key required'),
    body('value').trim().notEmpty().withMessage('Value required'),
    body('source_conversation').optional().isUUID(),
    body('confidence').optional().isFloat({ min: 0, max: 1 }),
  ]),
  memoryController.create
);

router.get(
  '/',
  validate([query('type').optional().isIn(memoryTypes)]),
  memoryController.list
);

router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid memory ID')]),
  memoryController.getById
);

router.post(
  '/:id/deactivate',
  validate([param('id').isUUID().withMessage('Invalid memory ID')]),
  memoryController.deactivate
);

export default router;
