-- Ensure refresh_tokens table exists (required for login/refresh).
-- Run if login returns 500: psql $DATABASE_URL -f scripts/migrate-refresh-tokens.sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          TEXT            NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ     NOT NULL,
    revoked_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);
