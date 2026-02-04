import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();
router.use(authMiddleware);

router.get('/me', userController.getProfile);

router.patch(
  '/me',
  validate([
    body('display_name').optional().trim().isString(),
    body('avatar_url').optional().trim().isURL().withMessage('Valid URL required'),
    body('preferred_language').optional().isIn(['en', 'bn']).withMessage('Must be en or bn'),
  ]),
  userController.updateProfile
);

export default router;
