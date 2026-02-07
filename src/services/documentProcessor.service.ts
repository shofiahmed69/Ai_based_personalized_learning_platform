import * as documentService from './document.service';
import { extractTextFromFile } from './extract.service';
import { summarizeWithGemini, isGeminiConfigured } from './gemini.service';
import { searchLearningVideos } from './youtube.service';
import { UPLOAD_DIR } from '../config/upload';
import path from 'path';

/**
 * Process a document: extract text → summarize with Gemini → fetch YouTube learning courses → set INDEXED.
 * Runs async; updates status to EXTRACTING, then CHUNKING, then INDEXED or FAILED.
 */
export async function processDocument(documentId: string, userId: string): Promise<void> {
  try {
    const doc = await documentService.getById(documentId, userId);
    const storagePath = doc.storage_path;
    // Security: strictly use basename and join with UPLOAD_DIR to prevent path traversal / LFI
    const filePath = path.join(UPLOAD_DIR, path.basename(storagePath));
    console.log('[Document] Processing started:', doc.title, '→', filePath);

    await documentService.updateStatus(documentId, userId, 'EXTRACTING');

    let fullText: string;
    try {
      fullText = await extractTextFromFile(filePath, doc.file_type as documentService.DocumentType);
    } catch (extractErr) {
      const msg = extractErr instanceof Error ? extractErr.message : 'Extraction failed';
      console.error('[Document] Extract failed:', doc.id, msg);
      await documentService.updateStatus(documentId, userId, 'FAILED', {
        error_message: `Extraction failed: ${msg}. Ensure the file was uploaded via Upload (not just metadata).`,
      });
      return;
    }

    if (!fullText || fullText.length < 10) {
      await documentService.updateStatus(documentId, userId, 'FAILED', {
        error_message: 'Could not extract enough text from the document.',
      });
      return;
    }

    await documentService.updateStatus(documentId, userId, 'CHUNKING');

    let summary: string;
    if (isGeminiConfigured()) {
      try {
        summary = await summarizeWithGemini(fullText, doc.title);
      } catch (geminiErr) {
        console.error('[Document] Gemini summarization failed:', doc.id, geminiErr instanceof Error ? geminiErr.message : geminiErr);
        summary = fullText.slice(0, 500) + (fullText.length > 500 ? '…' : '');
      }
    } else {
      summary = fullText.slice(0, 500) + (fullText.length > 500 ? '…' : '');
    }

    let learningCourses: unknown = null;
    try {
      learningCourses = await searchLearningVideos(summary);
    } catch (ytErr) {
      console.warn('[Document] YouTube learning courses failed (non-fatal):', doc.id, ytErr instanceof Error ? ytErr.message : ytErr);
    }

    await documentService.updateStatus(documentId, userId, 'INDEXED', {
      summary,
      learning_courses: Array.isArray(learningCourses) && learningCourses.length > 0 ? learningCourses : null,
    });
    console.log('[Document] Indexed:', doc.title);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed';
    console.error('[Document] Processing failed:', documentId, message);
    await documentService.updateStatus(documentId, userId, 'FAILED', {
      error_message: message,
    }).catch(() => {});
  }
}
