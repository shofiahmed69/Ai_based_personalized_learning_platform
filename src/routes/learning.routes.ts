import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as learningController from '../controllers/learning.controller';

const router = Router();

router.get('/courses', authMiddleware, learningController.getCourses);

export default router;
