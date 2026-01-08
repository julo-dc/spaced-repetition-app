-- 1. Add content-hash column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- 2. Populate hashes for all existing questions
UPDATE questions 
SET content_hash = md5(content::text);

-- 3. Remove existing duplicates based on (topic_id, content_hash)
-- PostgreSQL doesn't support MIN(uuid), so we cast to text
DELETE FROM questions
WHERE id NOT IN (
    SELECT (MIN(id::text))::uuid
    FROM questions
    GROUP BY topic_id, content_hash
);

-- 4. Create unique constraint to prevent future duplicates
DROP INDEX IF EXISTS idx_questions_unique_content;
CREATE UNIQUE INDEX idx_questions_unique_content 
ON questions(topic_id, content_hash);

-- 5. Set up auto-hashing trigger for new inserts/updates
CREATE OR REPLACE FUNCTION generate_question_content_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_hash = md5(NEW.content::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_questions_content_hash ON questions;
CREATE TRIGGER trg_questions_content_hash
    BEFORE INSERT OR UPDATE OF content ON questions
    FOR EACH ROW
    EXECUTE FUNCTION generate_question_content_hash();

-- 6. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_content_gin ON questions USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON questions(topic_id, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_popular ON questions(topic_id, difficulty_level) WHERE times_shown > 100;

-- 7. Add housekeeping columns
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. Setup updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_questions_updated_at ON questions;
CREATE TRIGGER trg_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
