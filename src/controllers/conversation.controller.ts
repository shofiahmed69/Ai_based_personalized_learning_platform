import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import * as conversationService from '../services/conversation.service';
import { AuthRequest } from '../middleware/auth';

export async function create(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const conv = await conversationService.createConversation(req.userId!, req.body?.title);
    sendSuccess(res, { conversation: conv }, 'Conversation created', 201);
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
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const conversations = await conversationService.listConversations(req.userId!, limit);
    sendSuccess(res, { conversations });
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
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const result = await conversationService.getMessages(
      req.params.id,
      req.userId!,
      limit
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function addMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { role, content, sources, memories_used, groq_usage } = req.body;
    const msg = await conversationService.addMessage(
      req.params.id,
      req.userId!,
      role,
      content,
      { sources, memories_used, groq_usage }
    );
    let assistantMessage = null;
    if (role === 'user') {
      try {
        assistantMessage = await conversationService.generateAndAddAssistantReply(
          req.params.id,
          req.userId!
        );
      } catch (err) {
        console.error('[Chat] Gemini reply failed:', err instanceof Error ? err.message : err);
      }
    }
    sendSuccess(
      res,
      { message: msg, assistantMessage: assistantMessage ?? undefined },
      'Message added',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function updateTitle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const conv = await conversationService.updateConversationTitle(
      req.params.id,
      req.userId!,
      req.body.title
    );
    sendSuccess(res, { conversation: conv }, 'Title updated');
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
    await conversationService.archiveConversation(req.params.id, req.userId!);
    sendSuccess(res, null, 'Conversation archived');
  } catch (error) {
    next(error);
  }
}
