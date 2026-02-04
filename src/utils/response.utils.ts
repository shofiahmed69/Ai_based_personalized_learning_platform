import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message: message ?? undefined,
    data,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string
): void {
  res.status(statusCode).json({
    success: false,
    message,
    code: code ?? undefined,
  });
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void {
  res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
}
