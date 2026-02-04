import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // PostgreSQL / pg errors
  const pgCode = (err as { code?: string }).code;
  if (pgCode === '23505') {
    res.status(409).json({
      success: false,
      message: 'Resource already exists (unique constraint).',
      code: 'CONFLICT',
    });
    return;
  }
  if (pgCode === '23503') {
    res.status(404).json({
      success: false,
      message: 'Referenced resource not found.',
      code: 'NOT_FOUND',
    });
    return;
  }

  const statusCode = 500;
  const message =
    env.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Unknown error';

  console.error('[500]', err.message, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv !== 'production' && { stack: err.stack }),
  });
}
