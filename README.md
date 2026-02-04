# AI Knowledge Base API

Express + PostgreSQL API for the AI Knowledge Base (pgvector, documents, tags, conversations, memories). Uses the schema in `schema.sql`.

## Requirements

- Node.js 18+
- PostgreSQL 16+ with [pgvector](https://github.com/pgvector/pgvector) extension

## Setup

### 1. Database (choose one)

**Option A — Docker (recommended: creates DB and runs schema)**

```bash
# Start PostgreSQL 16 with pgvector (creates DB ai_knowledge_base)
docker compose up -d

# Wait a few seconds, then apply schema
npm run db:setup
```

`.env.example` uses `postgresql://postgres:postgres@localhost:5432/ai_knowledge_base` for this setup.

**Option B — Existing PostgreSQL 16+ with pgvector**

```bash
# Create database (use your postgres user/password)
createdb -h localhost -U postgres ai_knowledge_base
# Or: psql -h localhost -U postgres -c "CREATE DATABASE ai_knowledge_base;"

# Copy env and set DATABASE_URL in .env, then apply schema
cp .env.example .env
# Edit .env: DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ai_knowledge_base
npm run db:setup
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` if needed:

- **DATABASE_URL** – PostgreSQL connection string (required; see above).
- **JWT_SECRET** – Secret for access tokens (required in production).
- **GEMINI_API_KEY** – [Google AI Studio](https://aistudio.google.com/apikey) API key for chat and document summarization (optional).
- **YOUTUBE_API_KEY** – [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key for learning course videos based on summarized topics (optional).

### 3. Install and run

```bash
npm install
npm run dev
```

Server runs at `http://localhost:3000` (or `PORT` from `.env`).

### 4. Check connection and test endpoints

- **Health (includes DB status):** `GET /health` → `{ "ok": true, "database": "connected"|"disconnected", "timestamp": "..." }`
- **AI/chat configured:** `GET /api/config` → `{ "groq_configured": true|false }` (true when Gemini is configured)
- **Run all endpoint tests:** `npm run test:api` (requires DB connected and schema applied; start server with `npm run dev` first).

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| GET | /api/config | No | Config flags (e.g. `groq_configured` when Gemini is set) |
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/refresh | No | Refresh access token |
| GET | /api/users/me | Yes | Current user profile |
| PATCH | /api/users/me | Yes | Update profile |
| POST | /api/documents | Yes | Create document metadata |
| GET | /api/documents | Yes | List documents (optional: status, tag_id, page, limit) |
| GET | /api/documents/:id | Yes | Get document |
| PATCH | /api/documents/:id/status | Yes | Update document status |
| POST | /api/documents/:id/archive | Yes | Archive document |
| POST | /api/tags | Yes | Create tag |
| GET | /api/tags | Yes | List tags |
| GET | /api/tags/:id | Yes | Get tag |
| PATCH | /api/tags/:id | Yes | Update tag |
| POST | /api/tags/documents/:documentId/tags/:tagId | Yes | Add tag to document |
| DELETE | /api/tags/documents/:documentId/tags/:tagId | Yes | Remove tag from document |
| POST | /api/tags/relationships | Yes | Create tag relationship |
| POST | /api/conversations | Yes | Create conversation |
| GET | /api/conversations | Yes | List conversations |
| GET | /api/conversations/:id | Yes | Get conversation and messages |
| POST | /api/conversations/:id/messages | Yes | Add message |
| PATCH | /api/conversations/:id/title | Yes | Update title |
| POST | /api/conversations/:id/archive | Yes | Archive conversation |
| POST | /api/memories | Yes | Create memory |
| GET | /api/memories | Yes | List memories (optional: type) |
| GET | /api/memories/:id | Yes | Get memory |
| POST | /api/memories/:id/deactivate | Yes | Deactivate memory |

Authenticated requests use header: `Authorization: Bearer <access_token>`.

## Frontends

### Next.js 15 frontend (spec-aligned, recommended)

The **Next.js 15 App Router** frontend in `frontend-next/` matches the full spec: Tailwind, TanStack Query, Zustand, AI chat UI, documents (list/upload/detail), knowledge graph (D3), memories, search placeholder.

```bash
cd frontend-next
npm install
npm run dev
```

- Dev server: **http://localhost:3000** (or the port Next prints). Ensure the **Express backend** is running on port 3000; Next rewrites `/api/*` to the backend when `NEXT_PUBLIC_API_URL` is unset.
- **Landing** → Login / Register → **Dashboard** → **Documents** (list, upload, detail), **Chat** (conversations + message UI), **Knowledge Graph** (D3), **Memories**, **Search** (placeholder).

### Vite + React frontend (legacy)

The original app lives in `frontend/` (Vite + React Router).

```bash
cd frontend
npm install
npm run dev
```

- Dev server: **http://localhost:5173**; API is proxied to the backend.

## API keys (Gemini + YouTube)

Add to `.env` in the **API project root** (not the frontend):

- **GEMINI_API_KEY** – Used for chat completions and document summarization.
- **YOUTUBE_API_KEY** – Used to fetch learning course videos related to each document’s summarized topics (shown on the document detail page).

The app exposes only whether the AI is configured at `GET /api/config` (`groq_configured`: true when Gemini is set); keys are never sent to the client.
