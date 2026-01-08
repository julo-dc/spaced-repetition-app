-- Run this in your Supabase SQL Editor: https://zloenaeghndjhhszrvpm.supabase.co/project/sql

-- Drop existing policies if they exist (to start fresh)
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can upsert their own state" ON user_topic_state;

-- Create RLS policies for reviews table
CREATE POLICY "Users can insert their own reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reviews" ON reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_topic_state table
CREATE POLICY "Users can manage their own topic state" ON user_topic_state
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Make sure RLS is enabled on both tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_state ENABLE ROW LEVEL SECURITY;

-- Verify policies were created
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('reviews', 'user_topic_state');
