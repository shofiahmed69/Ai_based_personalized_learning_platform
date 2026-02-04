import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as { email?: string; password?: string } | undefined;
    if (!body || typeof body !== 'object' || !body.email || !body.password) {
      return next(new AppError('Email and password required', 400, 'VALIDATION_ERROR'));
    }
    const result = await authService.login({ email: body.email, password: body.password });
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth login]', error instanceof Error ? error.message : error);
    }
    next(error);
  }
}

export async function refresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refresh_token: refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}
