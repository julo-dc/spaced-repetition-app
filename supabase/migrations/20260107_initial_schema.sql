-- Spaced Repetition App - Initial Schema Migration
-- Phase 1: Core tables for topics, questions, user progress, and review logs

-- 1. THE KNOWLEDGE GRAPH
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES topics(id),
    slug TEXT UNIQUE NOT NULL
);

-- 2. THE GLOBAL QUESTION POOL
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) NOT NULL,
    content JSONB NOT NULL,
    hints JSONB,
    full_solution JSONB,
    difficulty_level INTEGER DEFAULT 1,
    times_shown INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER PROGRESS
CREATE TABLE user_topic_state (
    user_id UUID REFERENCES auth.users(id),
    topic_id UUID REFERENCES topics(id),
    mastery_score FLOAT DEFAULT 0.0,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

-- 4. LOGS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    question_id UUID REFERENCES questions(id),
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    hints_used INTEGER DEFAULT 0,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_user_topic_state_user_id ON user_topic_state(user_id);
CREATE INDEX idx_user_topic_state_next_review ON user_topic_state(next_review_at);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_question_id ON reviews(question_id);
CREATE INDEX idx_reviews_reviewed_at ON reviews(reviewed_at);
