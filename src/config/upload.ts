import path from 'path';
import fs from 'fs';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}
