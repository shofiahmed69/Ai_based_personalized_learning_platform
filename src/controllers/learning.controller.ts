import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import { searchCseLearningCourses } from '../services/youtube.service';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/learning/courses — CSE learning courses from YouTube (auth required).
 */
export async function getCourses(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const courses = await searchCseLearningCourses();
    sendSuccess(res, { courses });
  } catch (error) {
    next(error);
  }
}
