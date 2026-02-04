import { query } from '../config/database';

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export interface SearchResultItem {
  document_id: string;
  document_title: string;
  snippet: string;
  score?: number;
}

/**
 * Search user's documents by keyword (title + summary).
 * Semantic/hybrid modes fall back to keyword until chunk embeddings exist.
 */
export async function search(
  userId: string,
  q: string,
  mode: SearchMode,
  limit = 20
): Promise<SearchResultItem[]> {
  const trimmed = (q ?? '').trim();
  if (!trimmed) return [];

  const safeLimit = Math.min(50, Math.max(1, limit));

  // Keyword search over documents (title, summary)
  const pattern = `%${trimmed.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
  const rows = await query<{
    id: string;
    title: string;
    summary: string | null;
  }>(
    `SELECT id, title, summary
     FROM documents
     WHERE user_id = $1
       AND status NOT IN ('ARCHIVED', 'FAILED')
       AND (title ILIKE $2 OR COALESCE(summary, '') ILIKE $2)
     ORDER BY updated_at DESC
     LIMIT $3`,
    [userId, pattern, safeLimit]
  );

  return rows.map((r) => ({
    document_id: r.id,
    document_title: r.title,
    snippet: r.summary
      ? r.summary.slice(0, 300) + (r.summary.length > 300 ? '…' : '')
      : r.title,
  }));
}
