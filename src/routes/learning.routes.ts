import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as learningController from '../controllers/learning.controller';

const router = Router();
router.use(authMiddleware);

router.get('/courses', learningController.getCourses);
router.get('/search', learningController.searchCourses);

export default router;
