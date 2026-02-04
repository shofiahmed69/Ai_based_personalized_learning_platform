import { Router } from 'express';
import * as learningController from '../controllers/learning.controller';

const router = Router();

router.get('/courses', learningController.getCourses);

export default router;
