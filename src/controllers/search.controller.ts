import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import * as searchService from '../services/search.service';
import { AuthRequest } from '../middleware/auth';

export async function search(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = (req.query.q as string) ?? '';
    const mode = (req.query.mode as searchService.SearchMode) ?? 'keyword';
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const results = await searchService.search(req.userId!, q, mode, limit);
    sendSuccess(res, { results });
  } catch (error) {
    next(error);
  }
}
