import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { query } from '../config/database';

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access';
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: { id: string; email: string };
}

export async function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (decoded.type !== 'access') {
      return next(new AppError('Invalid token type', 401, 'UNAUTHORIZED'));
    }
    const rows = await query<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );
    if (rows.length === 0) {
      return next(new AppError('User not found or inactive', 401, 'UNAUTHORIZED'));
    }
    req.userId = decoded.userId;
    req.user = rows[0];
    next();
  } catch (e) {
    if (e instanceof AppError) return next(e);
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}
