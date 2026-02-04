# AI Knowledge Base — Next.js Frontend

Next.js 15 App Router frontend matching the spec: Tailwind, TanStack Query, Zustand, auth, documents, chat, knowledge graph, memories.

## Setup

```bash
npm install
cp .env.example .env
```

In `.env`, set `NEXT_PUBLIC_API_URL` to your backend (e.g. `http://localhost:3000`) or leave empty to use Next.js rewrites to `http://localhost:3000` in dev.

## Run

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or the port Next shows). Ensure the **Express backend** is running on port 3000.

## Features

- **Landing** → Login / Register
- **Dashboard** → Stats, recent documents, “New chat”
- **Documents** → List (filter by status), upload (dropzone), detail (summary, tags), version history placeholder
- **Chat** → Conversation list, single conversation with message bubbles, send user messages (streaming UI ready when backend adds SSE)
- **Knowledge Graph** → D3 force-directed graph of tags (edges when backend adds `/api/tags/graph`)
- **Memories** → List by type, confidence bar, deactivate toggle
- **Search** → Placeholder page (backend `/search` not implemented yet)

API calls use the **existing Express backend** (`/api/auth/*`, `/api/documents`, `/api/tags`, `/api/conversations`, `/api/memories`). JWT refresh and language toggle are wired.
