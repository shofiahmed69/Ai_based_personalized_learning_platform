import fs from 'fs';
import path from 'path';
import type { DocumentType } from './document.service';

// Dynamic imports for optional deps
type PdfParseFn = (buf: Buffer) => Promise<{ text: string }>;
let pdfParse: PdfParseFn | null = null;
let mammoth: { extractRawText: (opts: { path: string }) => Promise<{ value: string }> } | null = null;

try {
  const p = require('pdf-parse');
  pdfParse = typeof p === 'function' ? p : (p?.default ?? null);
} catch {
  // optional
}

try {
  mammoth = require('mammoth');
} catch {
  // optional
}

const MAX_TEXT_LENGTH = 500_000;

export async function extractTextFromFile(
  filePath: string,
  fileType: DocumentType
): Promise<string> {
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error('File not found');
  }
  const buffer = fs.readFileSync(absPath);

  switch (fileType) {
    case 'PDF': {
      if (!pdfParse) throw new Error('PDF extraction not available (pdf-parse not installed)');
      const pdf = await pdfParse(buffer);
      const text = typeof pdf === 'object' && pdf !== null && 'text' in pdf ? (pdf as { text: string }).text : String(pdf);
      return text.slice(0, MAX_TEXT_LENGTH).trim();
    }
    case 'DOCX':
      if (!mammoth) throw new Error('DOCX extraction not available (mammoth not installed)');
      const docx = await mammoth.extractRawText({ path: absPath });
      return (docx?.value ?? '').slice(0, MAX_TEXT_LENGTH).trim();
    case 'TEXT':
    case 'MARKDOWN':
    case 'CODE':
      const raw = buffer.toString('utf-8');
      return raw.slice(0, MAX_TEXT_LENGTH).trim();
    default:
      return buffer.toString('utf-8').slice(0, MAX_TEXT_LENGTH).trim();
  }
}
