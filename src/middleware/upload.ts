import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { ensureUploadDir, UPLOAD_DIR } from '../config/upload';

ensureUploadDir();

const ALLOWED_MIMES: Record<string, string> = {
  'application/pdf': 'PDF',
  'text/plain': 'TEXT',
  'text/markdown': 'MARKDOWN',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype;
    if (ALLOWED_MIMES[mime]) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${mime}. Use PDF, TXT, Markdown, or DOCX.`));
    }
  },
});

export function getFileTypeFromMime(mimetype: string): string {
  return ALLOWED_MIMES[mimetype] ?? 'TEXT';
}
