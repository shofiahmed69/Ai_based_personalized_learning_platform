import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as documentController from '../controllers/document.controller';

const router = Router();
router.use(authMiddleware);

const documentStatuses = ['PENDING', 'EXTRACTING', 'CHUNKING', 'INDEXED', 'FAILED', 'ARCHIVED'];
const documentTypes = ['PDF', 'MARKDOWN', 'TEXT', 'CODE', 'DOCX'];

router.post('/upload', upload.single('file'), documentController.upload);

router.post(
  '/',
  validate([
    body('title').trim().notEmpty().withMessage('Title required'),
    body('original_filename').trim().notEmpty().withMessage('Original filename required'),
    body('file_type').isIn(documentTypes).withMessage('Invalid file type'),
    body('storage_path').trim().notEmpty().withMessage('Storage path required'),
    body('file_size_bytes').isInt({ min: 0 }).withMessage('File size must be non-negative'),
  ]),
  documentController.create
);

router.get(
  '/',
  validate([
    query('status').optional().isIn(documentStatuses),
    query('tag_id').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  documentController.list
);

router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid document ID')]),
  documentController.getById
);

router.patch(
  '/:id/status',
  validate([
    param('id').isUUID().withMessage('Invalid document ID'),
    body('status').isIn(documentStatuses).withMessage('Invalid status'),
    body('error_message').optional().trim().isString(),
    body('summary').optional().trim().isString(),
  ]),
  documentController.updateStatus
);

router.post(
  '/:id/archive',
  validate([param('id').isUUID().withMessage('Invalid document ID')]),
  documentController.archive
);

router.post(
  '/:id/tags',
  validate([
    param('id').isUUID().withMessage('Invalid document ID'),
    body('tag_id').isUUID().withMessage('Invalid tag ID'),
  ]),
  documentController.addTag
);

router.delete(
  '/:id/tags/:tagId',
  validate([
    param('id').isUUID().withMessage('Invalid document ID'),
    param('tagId').isUUID().withMessage('Invalid tag ID'),
  ]),
  documentController.removeTag
);

export default router;
