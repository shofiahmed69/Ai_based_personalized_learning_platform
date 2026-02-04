# Database setup (PostgreSQL + pgvector)

The schema uses the **vector** type (pgvector). The extension name in PostgreSQL is **`vector`** (not `pgvector`). If you see "extension pgvector is not available", install the package and use the steps below.

## Fix

### 1. Install pgvector for PostgreSQL 16

```bash
sudo apt update
sudo apt install postgresql-16-pgvector
```

### 2. Enable the extension in your database

```bash
sudo -u postgres psql -d ai_knowledge_base -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. Re-run the schema

```bash
cd "/media/sofi/New Volume/personal project"
sudo -u postgres psql -d ai_knowledge_base -f schema.sql
```

You should see no errors. The schema is idempotent (safe to re-run). The script now skips creating triggers on tables that don’t exist yet, and creates the missing tables (`document_chunks`, `memories`) once pgvector is enabled.
