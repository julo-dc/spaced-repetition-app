-- Run this in your Supabase SQL Editor to check and fix RLS policies
-- Go to: https://zloenaeghndjhhszrvpm.supabase.co/project/sql

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('reviews', 'user_topic_state');

-- If no policies exist, create basic ones for authenticated users
INSERT INTO pg_policies (
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
) VALUES
  ('reviews', 'Users can insert their own reviews', true, ARRAY['authenticated'], 'INSERT', 'auth.uid() = user_id', 'auth.uid() = user_id'),
  ('reviews', 'Users can view their own reviews', true, ARRAY['authenticated'], 'SELECT', 'auth.uid() = user_id', NULL),
  ('user_topic_state', 'Users can upsert their own state', true, ARRAY['authenticated'], 'ALL', 'auth.uid() = user_id', 'auth.uid() = user_id')
ON CONFLICT DO NOTHING;

-- Make sure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_state ENABLE ROW LEVEL SECURITY;
