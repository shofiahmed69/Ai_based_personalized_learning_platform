-- =============================================================================
-- AI KNOWLEDGE BASE — PostgreSQL Database Schema
-- =============================================================================
-- Requires: PostgreSQL 16+ with pgvector extension
-- Run:  psql -U <user> -d <db> -f schema.sql
-- =============================================================================

-- ─── 0. EXTENSIONS ─────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- trigram similarity (optional FTS boost)
CREATE EXTENSION IF NOT EXISTS btree_gin;        -- GIN on composite types


-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT            NOT NULL UNIQUE,
    password_hash       TEXT            NOT NULL,                        -- bcrypt / argon2
    display_name        TEXT,
    avatar_url          TEXT,
    preferred_language  TEXT            NOT NULL DEFAULT 'en',           -- 'en' | 'bn'
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);


-- =============================================================================
-- 2. DOCUMENTS
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'PENDING', 'EXTRACTING', 'CHUNKING', 'INDEXED', 'FAILED', 'ARCHIVED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('PDF', 'MARKDOWN', 'TEXT', 'CODE', 'DOCX');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS documents (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               TEXT            NOT NULL,
    original_filename   TEXT            NOT NULL,
    file_type           document_type   NOT NULL,
    storage_path        TEXT            NOT NULL,
    file_size_bytes     BIGINT          NOT NULL,
    status              document_status NOT NULL DEFAULT 'PENDING',
    summary             TEXT,
    learning_courses    JSONB,          -- [{ videoId, title, channelTitle, thumbnailUrl, url }]
    error_message       TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    indexed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_user       ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status     ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_user_status ON documents (user_id, status);


-- =============================================================================
-- 3. DOCUMENT CHUNKS
-- =============================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id         UUID            NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index         INTEGER         NOT NULL,
    content             TEXT            NOT NULL,
    embedding           vector(1536)    NOT NULL,
    fts_vector          tsvector        GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    token_count         INTEGER         NOT NULL,
    source_page         INTEGER,
    source_heading      TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
    ON document_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (ef_construction = 200, m = 16);

CREATE INDEX IF NOT EXISTS idx_chunks_fts
    ON document_chunks
    USING gin (fts_vector);

CREATE INDEX IF NOT EXISTS idx_chunks_doc_id
    ON document_chunks (document_id);


-- =============================================================================
-- 4. TAGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS tags (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                TEXT            NOT NULL,
    slug                TEXT            NOT NULL,
    description         TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_tags_user ON tags (user_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags (slug);


-- =============================================================================
-- 5. DOCUMENT ↔ TAG
-- =============================================================================
CREATE TABLE IF NOT EXISTS document_tags (
    document_id         UUID            NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag_id              UUID            NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags (tag_id);


-- =============================================================================
-- 6. TAG RELATIONSHIPS
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('IS_A', 'RELATED_TO', 'PART_OF', 'OPPOSITE_OF');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tag_relationships (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    source_tag_id       UUID            NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    target_tag_id       UUID            NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    relationship        relationship_type NOT NULL DEFAULT 'RELATED_TO',
    confidence          NUMERIC(3,2)    NOT NULL DEFAULT 1.00,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (source_tag_id, target_tag_id, relationship)
);

CREATE INDEX IF NOT EXISTS idx_tag_rel_source ON tag_relationships (source_tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_rel_target ON tag_relationships (target_tag_id);


-- =============================================================================
-- 7. MEMORIES
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE memory_type AS ENUM ('preference', 'context', 'interest', 'correction', 'fact');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS memories (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                memory_type     NOT NULL,
    key                 TEXT            NOT NULL,
    value               TEXT            NOT NULL,
    embedding           vector(1536),
    source_conversation UUID,
    confidence          NUMERIC(3,2)    NOT NULL DEFAULT 0.90,
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_memories_embedding_hnsw
    ON memories
    USING hnsw (embedding vector_cosine_ops)
    WITH (ef_construction = 100, m = 16);

CREATE INDEX IF NOT EXISTS idx_memories_user      ON memories (user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_type ON memories (user_id, type);


-- =============================================================================
-- 8. CONVERSATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id, created_at DESC);


-- =============================================================================
-- 9. CONVERSATION MESSAGES
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS conversation_messages (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID            NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role                message_role    NOT NULL,
    content             TEXT            NOT NULL,
    sources             JSONB,
    memories_used       JSONB,
    groq_usage          JSONB,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_conv   ON conversation_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conv_messages_role   ON conversation_messages (conversation_id, role);


-- =============================================================================
-- 10. DOCUMENT VERSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS document_versions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id         UUID            NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number      INTEGER         NOT NULL,
    content             TEXT            NOT NULL,
    diff_from_previous  JSONB,
    changed_by          TEXT            NOT NULL DEFAULT 'system',
    change_reason       TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_doc ON document_versions (document_id, version_number DESC);


-- =============================================================================
-- 11. REFRESH TOKENS
-- =============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          TEXT            NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ     NOT NULL,
    revoked_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);


-- =============================================================================
-- 12. JOB AUDIT
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS job_audit (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type            TEXT            NOT NULL,
    bull_job_id         TEXT,
    entity_type         TEXT            NOT NULL,
    entity_id           UUID            NOT NULL,
    status              job_status      NOT NULL DEFAULT 'QUEUED',
    error               TEXT,
    duration_ms         INTEGER,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_audit_entity ON job_audit (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_job_audit_status ON job_audit (status);


-- =============================================================================
-- 13. HELPER: auto-update updated_at triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
    DECLARE
        tbl TEXT;
        tbl_exists BOOLEAN;
    BEGIN
        FOR tbl IN VALUES ('users'), ('documents'), ('memories'), ('conversations') LOOP
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = tbl
            ) INTO tbl_exists;
            IF tbl_exists THEN
                EXECUTE format(
                    'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;',
                    tbl, tbl
                );
                EXECUTE format(
                    'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I '
                    'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
                    tbl, tbl
                );
            END IF;
        END LOOP;
    END
$$;


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
