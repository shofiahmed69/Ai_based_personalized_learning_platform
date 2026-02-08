import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import { searchCseLearningCourses, searchYouTubeByQuery } from '../services/youtube.service';
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

/**
 * GET /api/learning/search?q=... — Search YouTube for any course by user query (auth required).
 */
export async function searchCourses(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = String(req.query.q ?? '').trim();
    const courses = await searchYouTubeByQuery(q);
    sendSuccess(res, { courses });
  } catch (error) {
    next(error);
  }
}
