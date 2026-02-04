-- Add learning_courses column to documents (for YouTube learning videos).
-- Run once if your database was created before this feature:
--   psql -U <user> -d ai_knowledge_base -f scripts/migrate-learning-courses.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'learning_courses'
  ) THEN
    ALTER TABLE documents ADD COLUMN learning_courses JSONB;
  END IF;
END $$;
