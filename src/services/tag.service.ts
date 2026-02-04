import { query } from '../config/database';
import { AppError } from '../utils/AppError';

export type RelationshipType = 'IS_A' | 'RELATED_TO' | 'PART_OF' | 'OPPOSITE_OF';

export interface CreateTagInput {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  slug?: string;
  description?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function create(userId: string, input: CreateTagInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  const rows = await query<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: Date;
  }>(
    `INSERT INTO tags (user_id, name, slug, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
     RETURNING id, name, slug, description, created_at`,
    [userId, input.name.trim(), slug, input.description ?? null]
  );
  const tag = rows[0];
  if (!tag) throw new AppError('Failed to create tag', 500);
  return tag;
}

export async function listByUser(userId: string) {
  return query<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: Date;
  }>(
    'SELECT id, name, slug, description, created_at FROM tags WHERE user_id = $1 ORDER BY name',
    [userId]
  );
}

export async function getById(tagId: string, userId: string) {
  const rows = await query<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: Date;
  }>('SELECT id, name, slug, description, created_at FROM tags WHERE id = $1 AND user_id = $2', [
    tagId,
    userId,
  ]);
  const tag = rows[0];
  if (!tag) throw new AppError('Tag not found', 404, 'NOT_FOUND');
  return tag;
}

export async function update(tagId: string, userId: string, input: UpdateTagInput) {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (input.name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(input.name.trim());
  }
  if (input.slug !== undefined) {
    updates.push(`slug = $${i++}`);
    values.push(input.slug.trim());
  }
  if (input.description !== undefined) {
    updates.push(`description = $${i++}`);
    values.push(input.description);
  }
  if (updates.length === 0) return getById(tagId, userId);
  values.push(tagId, userId);
  const rows = await query(
    `UPDATE tags SET ${updates.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING id, name, slug, description, created_at`,
    values
  );
  if (rows.length === 0) throw new AppError('Tag not found', 404, 'NOT_FOUND');
  return rows[0] as Awaited<ReturnType<typeof getById>>;
}

export async function addDocumentTag(documentId: string, tagId: string, userId: string) {
  await query(
    `INSERT INTO document_tags (document_id, tag_id)
     SELECT $1, $2 FROM documents d WHERE d.id = $1 AND d.user_id = $3
     ON CONFLICT (document_id, tag_id) DO NOTHING`,
    [documentId, tagId, userId]
  );
  const doc = await query(
    'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
    [documentId, userId]
  );
  if (doc.length === 0) throw new AppError('Document not found', 404, 'NOT_FOUND');
  const tag = await query('SELECT id FROM tags WHERE id = $1 AND user_id = $2', [tagId, userId]);
  if (tag.length === 0) throw new AppError('Tag not found', 404, 'NOT_FOUND');
}

export async function removeDocumentTag(documentId: string, tagId: string, userId: string) {
  const result = await query(
    `DELETE FROM document_tags dt
     USING documents d
     WHERE dt.document_id = d.id AND d.user_id = $1 AND dt.document_id = $2 AND dt.tag_id = $3`,
    [userId, documentId, tagId]
  );
  return result;
}

export async function listGraph(userId: string) {
  const tags = await listByUser(userId);
  const relationships = await query<{
    id: string;
    source_tag_id: string;
    target_tag_id: string;
    relationship: string;
    confidence: number;
    created_at: Date;
  }>(
    `SELECT tr.id, tr.source_tag_id, tr.target_tag_id, tr.relationship, tr.confidence, tr.created_at
     FROM tag_relationships tr
     JOIN tags t ON t.id = tr.source_tag_id AND t.user_id = $1
     ORDER BY tr.created_at`,
    [userId]
  );
  return { nodes: tags, edges: relationships };
}

export async function createRelationship(
  userId: string,
  sourceTagId: string,
  targetTagId: string,
  relationship: RelationshipType = 'RELATED_TO',
  confidence: number = 1
) {
  await getById(sourceTagId, userId);
  await getById(targetTagId, userId);
  const rows = await query<{ id: string }>(
    `INSERT INTO tag_relationships (source_tag_id, target_tag_id, relationship, confidence)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (source_tag_id, target_tag_id, relationship) DO UPDATE SET confidence = EXCLUDED.confidence
     RETURNING id`,
    [sourceTagId, targetTagId, relationship, confidence]
  );
  if (rows.length === 0) throw new AppError('Failed to create relationship', 500);
  return rows[0];
}
