import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validateRequest';
import { authRateLimiter } from '../middleware/rateLimit';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('display_name').optional().trim().isString(),
    body('preferred_language').optional().isIn(['en', 'bn']).withMessage('Must be en or bn'),
  ]),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ]),
  authController.login
);

router.post(
  '/refresh',
  validate([body('refresh_token').notEmpty().withMessage('Refresh token required')]),
  authController.refresh
);

export default router;
