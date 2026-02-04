// ─── AUTH ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'bn';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login_at: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ─── DOCUMENTS ───────────────────────────────────────────────
export type DocumentStatus =
  | 'PENDING'
  | 'EXTRACTING'
  | 'CHUNKING'
  | 'INDEXED'
  | 'FAILED'
  | 'ARCHIVED';

export type DocumentType = 'PDF' | 'MARKDOWN' | 'TEXT' | 'CODE' | 'DOCX';

export interface LearningCourseVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
}

export interface Document {
  id: string;
  user_id?: string;
  title: string;
  original_filename: string;
  file_type: DocumentType;
  file_size_bytes?: number;
  status: DocumentStatus;
  summary: string | null;
  learning_courses: LearningCourseVideo[] | null;
  error_message: string | null;
  created_at: string;
  updated_at?: string;
  indexed_at: string | null;
  tags?: Tag[];
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content: string;
  diff_from_previous: Record<string, unknown> | null;
  changed_by: 'system' | 'user' | 'ai';
  change_reason: string | null;
  created_at: string;
}

// ─── TAGS & GRAPH ────────────────────────────────────────────
export interface Tag {
  id: string;
  user_id?: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export type RelationshipType = 'IS_A' | 'RELATED_TO' | 'PART_OF' | 'OPPOSITE_OF';

export interface TagRelationship {
  id: string;
  source_tag_id: string;
  target_tag_id: string;
  relationship: RelationshipType;
  confidence: number;
  created_at: string;
}

export interface GraphPayload {
  nodes: Tag[];
  edges: TagRelationship[];
}

// ─── MEMORIES ────────────────────────────────────────────────
export type MemoryType = 'preference' | 'context' | 'interest' | 'correction' | 'fact';

export interface Memory {
  id: string;
  user_id?: string;
  type: MemoryType;
  key: string;
  value: string;
  confidence: number;
  last_used_at: string | null;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

// ─── CONVERSATIONS & MESSAGES ────────────────────────────────
export interface Conversation {
  id: string;
  user_id?: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

export interface SourceCitation {
  chunk_id: string;
  document_id?: string;
  doc_title: string;
  snippet: string;
}

export interface MemoryUsedRef {
  memory_id: string;
  key: string;
  value: string;
}

export interface GroqUsage {
  prompt_tokens: number;
  completion_tokens: number;
  model: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources: SourceCitation[] | null;
  memories_used: MemoryUsedRef[] | null;
  groq_usage: GroqUsage | null;
  created_at: string;
}

// ─── SEARCH ──────────────────────────────────────────────────
export type SearchMode = 'hybrid' | 'semantic' | 'keyword';

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  doc_title: string;
  snippet: string;
  score: number;
  source_page: number | null;
  source_heading: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next?: boolean;
}
