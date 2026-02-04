import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import * as memoryService from '../services/memory.service';
import { AuthRequest } from '../middleware/auth';

export async function create(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const memory = await memoryService.create(req.userId!, req.body);
    sendSuccess(res, { memory }, 'Memory created', 201);
  } catch (error) {
    next(error);
  }
}

export async function list(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const type = req.query.type as memoryService.MemoryType | undefined;
    const memories = await memoryService.listByUser(req.userId!, type);
    sendSuccess(res, { memories });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const memory = await memoryService.getById(req.params.id, req.userId!);
    sendSuccess(res, { memory });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await memoryService.deactivate(req.params.id, req.userId!);
    sendSuccess(res, null, 'Memory deactivated');
  } catch (error) {
    next(error);
  }
}
