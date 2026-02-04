import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import * as tagController from '../controllers/tag.controller';

const router = Router();
router.use(authMiddleware);

const relationshipTypes = ['IS_A', 'RELATED_TO', 'PART_OF', 'OPPOSITE_OF'];

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Name required'),
    body('slug').optional().trim().isString(),
    body('description').optional().trim().isString(),
  ]),
  tagController.create
);

router.get('/', tagController.list);

router.get('/graph', tagController.getGraph);

router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid tag ID')]),
  tagController.getById
);

router.patch(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Invalid tag ID'),
    body('name').optional().trim().notEmpty(),
    body('slug').optional().trim().isString(),
    body('description').optional().trim().isString(),
  ]),
  tagController.update
);

router.post(
  '/relationships',
  validate([
    body('source_tag_id').isUUID().withMessage('Invalid source tag ID'),
    body('target_tag_id').isUUID().withMessage('Invalid target tag ID'),
    body('relationship').optional().isIn(relationshipTypes),
    body('confidence').optional().isFloat({ min: 0, max: 1 }),
  ]),
  tagController.createRelationship
);

export default router;
