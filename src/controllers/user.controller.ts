import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import * as userService from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await userService.getProfile(userId);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await userService.updateProfile(userId, req.body);
    sendSuccess(res, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
}
