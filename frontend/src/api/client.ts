const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error(res.ok ? text : `Request failed: ${res.status}`);
  }
  if (!res.ok) {
    const err = data as { message?: string };
    throw new Error(err?.message ?? `Request failed: ${res.status}`);
  }
  const payload = (data as { data?: T }).data !== undefined ? (data as { data: T }).data : (data as T);
  return { data: payload, status: res.status };
}

export const auth = {
  register: (email: string, password: string, displayName?: string) =>
    api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName }),
    }),
  login: (email: string, password: string) =>
    api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const users = {
  me: () => api<{ user: User }>('/api/users/me'),
  updateMe: (body: { display_name?: string; preferred_language?: string }) =>
    api<{ user: User }>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
};

export const documents = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const query = q.toString();
    return api<{ items: Document[]; pagination: Pagination }>(`/api/documents${query ? `?${query}` : ''}`);
  },
  get: (id: string) => api<{ document: Document }>(`/api/documents/${id}`),
  create: (body: { title: string; original_filename: string; file_type: string; storage_path: string; file_size_bytes: number }) =>
    api<{ document: Document }>('/api/documents', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: string, options?: { error_message?: string; summary?: string }) =>
    api<{ document: Document }>(`/api/documents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...options }),
    }),
  archive: (id: string) =>
    api<{ document: Document }>(`/api/documents/${id}/archive`, { method: 'POST' }),
  addTag: (id: string, tagId: string) =>
    api<unknown>(`/api/documents/${id}/tags`, { method: 'POST', body: JSON.stringify({ tag_id: tagId }) }),
  removeTag: (id: string, tagId: string) =>
    api<unknown>(`/api/documents/${id}/tags/${tagId}`, { method: 'DELETE' }),
};

export const tags = {
  list: () => api<{ tags: Tag[] }>('/api/tags'),
  get: (id: string) => api<{ tag: Tag }>(`/api/tags/${id}`),
  create: (body: { name: string; slug?: string; description?: string }) =>
    api<{ tag: Tag }>('/api/tags', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { name?: string; description?: string }) =>
    api<{ tag: Tag }>(`/api/tags/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const conversations = {
  list: (limit?: number) =>
    api<{ conversations: Conversation[] }>(`/api/conversations${limit ? `?limit=${limit}` : ''}`),
  get: (id: string) =>
    api<{ conversation: Conversation; messages: Message[] }>(`/api/conversations/${id}`),
  create: (title?: string) =>
    api<{ conversation: Conversation }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(title ? { title } : {}),
    }),
  addMessage: (id: string, role: 'user' | 'assistant' | 'system', content: string) =>
    api<{ message: Message }>(`/api/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    }),
  updateTitle: (id: string, title: string) =>
    api<{ conversation: Conversation }>(`/api/conversations/${id}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
  archive: (id: string) =>
    api<unknown>(`/api/conversations/${id}/archive`, { method: 'POST' }),
};

export const memories = {
  list: (type?: string) =>
    api<{ memories: Memory[] }>(`/api/memories${type ? `?type=${type}` : ''}`),
  get: (id: string) => api<{ memory: Memory }>(`/api/memories/${id}`),
  create: (body: { type: string; key: string; value: string }) =>
    api<{ memory: Memory }>('/api/memories', { method: 'POST', body: JSON.stringify(body) }),
  deactivate: (id: string) =>
    api<unknown>(`/api/memories/${id}/deactivate`, { method: 'POST' }),
};

export const health = () =>
  fetch(API_BASE ? `${API_BASE}/health` : '/health').then((r) => r.json()) as Promise<{ ok: boolean; database: string }>;

// Types matching backend
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
  preferred_language: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface Document {
  id: string;
  title: string;
  original_filename: string;
  file_type: string;
  storage_path?: string;
  file_size_bytes?: number;
  status: string;
  summary?: string | null;
  error_message?: string | null;
  created_at: string;
  indexed_at?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface Memory {
  id: string;
  type: string;
  key: string;
  value: string;
  confidence?: number;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
