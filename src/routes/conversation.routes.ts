import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import * as conversationController from '../controllers/conversation.controller';

const router = Router();
router.use(authMiddleware);

router.post(
  '/',
  validate([body('title').optional().trim().isString()]),
  conversationController.create
);

router.get(
  '/',
  validate([query('limit').optional().isInt({ min: 1, max: 100 })]),
  conversationController.list
);

router.get(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Invalid conversation ID'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  conversationController.getById
);

router.post(
  '/:id/messages',
  validate([
    param('id').isUUID().withMessage('Invalid conversation ID'),
    body('role').isIn(['user', 'assistant', 'system']).withMessage('Invalid role'),
    body('content').notEmpty().withMessage('Content required'),
    body('sources').optional().isArray(),
    body('memories_used').optional().isArray(),
    body('groq_usage').optional().isObject(),
  ]),
  conversationController.addMessage
);

router.patch(
  '/:id/title',
  validate([
    param('id').isUUID().withMessage('Invalid conversation ID'),
    body('title').trim().notEmpty().withMessage('Title required'),
  ]),
  conversationController.updateTitle
);

router.post(
  '/:id/archive',
  validate([param('id').isUUID().withMessage('Invalid conversation ID')]),
  conversationController.archive
);

export default router;
