-- Fix schema mismatches
-- Add missing columns that the code expects

-- Add last_practiced_at to user_topic_state (optional, for tracking)
ALTER TABLE user_topic_state ADD COLUMN last_practiced_at TIMESTAMP WITH TIME ZONE;

-- Rename time_taken_seconds to time_spent_seconds in reviews to match code expectations
ALTER TABLE reviews RENAME COLUMN time_taken_seconds TO time_spent_seconds;
