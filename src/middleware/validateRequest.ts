import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../utils/AppError';

export function validateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array({ onlyFirstError: true })[0];
    const message =
      first && 'msg' in first && typeof first.msg === 'string'
        ? first.msg
        : 'Validation failed';
    throw new AppError(message, 400, 'VALIDATION_ERROR');
  }
  next();
}

export function validate(validations: ValidationChain[]) {
  return [...validations, validateRequest];
}
