-- Run this in your Supabase SQL Editor: https://zloenaeghndjhhszrvpm.supabase.co/project/sql

-- Add the missing last_practiced_at column to user_topic_state table
ALTER TABLE user_topic_state 
ADD COLUMN last_practiced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
