import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import * as tagService from '../services/tag.service';
import { AuthRequest } from '../middleware/auth';

export async function create(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tag = await tagService.create(req.userId!, req.body);
    sendSuccess(res, { tag }, 'Tag created', 201);
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
    const tags = await tagService.listByUser(req.userId!);
    sendSuccess(res, { tags });
  } catch (error) {
    next(error);
  }
}

export async function getGraph(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const graph = await tagService.listGraph(req.userId!);
    sendSuccess(res, graph);
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
    const tag = await tagService.getById(req.params.id, req.userId!);
    sendSuccess(res, { tag });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tag = await tagService.update(req.params.id, req.userId!, req.body);
    sendSuccess(res, { tag }, 'Tag updated');
  } catch (error) {
    next(error);
  }
}

export async function addDocumentTag(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await tagService.addDocumentTag(req.params.documentId, req.params.tagId, req.userId!);
    sendSuccess(res, null, 'Tag added to document');
  } catch (error) {
    next(error);
  }
}

export async function removeDocumentTag(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await tagService.removeDocumentTag(req.params.documentId, req.params.tagId, req.userId!);
    sendSuccess(res, null, 'Tag removed from document');
  } catch (error) {
    next(error);
  }
}

export async function createRelationship(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rel = await tagService.createRelationship(
      req.userId!,
      req.body.source_tag_id,
      req.body.target_tag_id,
      req.body.relationship,
      req.body.confidence
    );
    sendSuccess(res, { relationship: rel }, 'Relationship created', 201);
  } catch (error) {
    next(error);
  }
}
