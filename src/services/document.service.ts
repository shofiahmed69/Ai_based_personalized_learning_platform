import { query } from '../config/database';
import { AppError } from '../utils/AppError';

export type DocumentStatus =
  | 'PENDING'
  | 'EXTRACTING'
  | 'CHUNKING'
  | 'INDEXED'
  | 'FAILED'
  | 'ARCHIVED';
export type DocumentType = 'PDF' | 'MARKDOWN' | 'TEXT' | 'CODE' | 'DOCX';

export interface CreateDocumentInput {
  title: string;
  original_filename: string;
  file_type: DocumentType;
  storage_path: string;
  file_size_bytes: number;
}

export interface ListDocumentsFilters {
  status?: DocumentStatus;
  tag_id?: string;
  page?: number;
  limit?: number;
}

export async function create(
  userId: string,
  input: CreateDocumentInput
) {
  const rows = await query<{
    id: string;
    title: string;
    original_filename: string;
    file_type: string;
    storage_path: string;
    file_size_bytes: number;
    status: string;
    created_at: Date;
  }>(
    `INSERT INTO documents (user_id, title, original_filename, file_type, storage_path, file_size_bytes, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
     RETURNING id, title, original_filename, file_type, storage_path, file_size_bytes, status, created_at`,
    [
      userId,
      input.title,
      input.original_filename,
      input.file_type,
      input.storage_path,
      input.file_size_bytes,
    ]
  );
  const doc = rows[0];
  if (!doc) throw new AppError('Failed to create document', 500);
  return doc;
}

export async function listByUser(
  userId: string,
  filters: ListDocumentsFilters = {}
) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;

  let where = 'd.user_id = $1';
  const params: unknown[] = [userId];
  let i = 2;
  if (filters.status) {
    where += ` AND d.status = $${i++}`;
    params.push(filters.status);
  }
  if (filters.tag_id) {
    where += ` AND EXISTS (SELECT 1 FROM document_tags dt WHERE dt.document_id = d.id AND dt.tag_id = $${i++})`;
    params.push(filters.tag_id);
  }

  const countRows = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM documents d WHERE ${where}`,
    params
  );
  const total = parseInt(countRows[0]?.count ?? '0', 10);

  params.push(limit, offset);
  const items = await query<{
    id: string;
    title: string;
    original_filename: string;
    file_type: string;
    status: string;
    summary: string | null;
    created_at: Date;
  }>(
    `SELECT d.id, d.title, d.original_filename, d.file_type, d.status, d.summary, d.created_at
     FROM documents d
     WHERE ${where}
     ORDER BY d.created_at DESC
     LIMIT $${i++} OFFSET $${i}`,
    params
  );
  return { items, total, page, limit };
}

export async function getById(documentId: string, userId: string) {
  const rows = await query<{
    id: string;
    title: string;
    original_filename: string;
    file_type: string;
    storage_path: string;
    file_size_bytes: number;
    status: string;
    summary: string | null;
    learning_courses: unknown;
    error_message: string | null;
    created_at: Date;
    indexed_at: Date | null;
  }>(
    'SELECT id, title, original_filename, file_type, storage_path, file_size_bytes, status, summary, learning_courses, error_message, created_at, indexed_at FROM documents WHERE id = $1 AND user_id = $2',
    [documentId, userId]
  );
  const doc = rows[0];
  if (!doc) throw new AppError('Document not found', 404, 'NOT_FOUND');
  return doc;
}

export async function updateStatus(
  documentId: string,
  userId: string,
  status: DocumentStatus,
  options?: { error_message?: string; summary?: string; learning_courses?: unknown }
) {
  const updates: string[] = ['status = $1'];
  const values: unknown[] = [status];
  let i = 2;
  if (status === 'INDEXED') {
    updates.push(`indexed_at = NOW()`);
  }
  if (options?.error_message !== undefined) {
    updates.push(`error_message = $${i++}`);
    values.push(options.error_message);
  }
  if (options?.summary !== undefined) {
    updates.push(`summary = $${i++}`);
    values.push(options.summary);
  }
  if (options?.learning_courses !== undefined) {
    updates.push(`learning_courses = $${i++}`);
    values.push(JSON.stringify(options.learning_courses));
  }
  values.push(documentId, userId);
  const rows = await query(
    `UPDATE documents SET ${updates.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING id`,
    values
  );
  if (rows.length === 0) throw new AppError('Document not found', 404, 'NOT_FOUND');
  return getById(documentId, userId);
}

export async function archive(documentId: string, userId: string) {
  return updateStatus(documentId, userId, 'ARCHIVED');
}
