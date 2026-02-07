import { Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import * as documentService from '../services/document.service';
import * as tagService from '../services/tag.service';
import * as documentProcessor from '../services/documentProcessor.service';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { getFileTypeFromMime } from '../middleware/upload';

export async function create(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, original_filename, file_type, file_size_bytes } = req.body;
    const doc = await documentService.create(req.userId!, {
      title,
      original_filename,
      file_type,
      file_size_bytes,
      storage_path: 'MANUAL_METADATA_ONLY', // Default to dummy path if created via metadata only
    });
    sendSuccess(res, { document: doc }, 'Document created', 201);
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
    const { status, tag_id, page, limit } = req.query;
    const result = await documentService.listByUser(req.userId!, {
      status: status as documentService.DocumentStatus | undefined,
      tag_id: tag_id as string | undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    });
    sendPaginated(res, result.items, result.page, result.limit, result.total);
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
    const doc = await documentService.getById(req.params.id, req.userId!);
    sendSuccess(res, { document: doc });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await documentService.updateStatus(
      req.params.id,
      req.userId!,
      req.body.status,
      { error_message: req.body.error_message, summary: req.body.summary }
    );
    sendSuccess(res, { document: doc }, 'Status updated');
  } catch (error) {
    next(error);
  }
}

export async function archive(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await documentService.archive(req.params.id, req.userId!);
    sendSuccess(res, { document: doc }, 'Document archived');
  } catch (error) {
    next(error);
  }
}

export async function addTag(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await tagService.addDocumentTag(req.params.id, req.body.tag_id, req.userId!);
    sendSuccess(res, null, 'Tag added to document');
  } catch (error) {
    next(error);
  }
}

export async function removeTag(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await tagService.removeDocumentTag(req.params.id, req.params.tagId, req.userId!);
    sendSuccess(res, null, 'Tag removed from document');
  } catch (error) {
    next(error);
  }
}

export async function upload(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      return next(new AppError('No file uploaded', 400, 'VALIDATION_ERROR'));
    }
    const fileType = getFileTypeFromMime(file.mimetype);
    const doc = await documentService.create(req.userId!, {
      title: file.originalname,
      original_filename: file.originalname,
      file_type: fileType as documentService.DocumentType,
      storage_path: file.filename,
      file_size_bytes: file.size,
    });
    documentProcessor.processDocument(doc.id, req.userId!).catch(() => {});
    sendSuccess(res, { document: doc }, 'Document uploaded — processing started', 201);
  } catch (error) {
    next(error);
  }
}
