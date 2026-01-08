// Run this script in the Supabase SQL Editor to fix the schema
// Go to https://zloenaeghndjhhszrvpm.supabase.co/project/sql

const sql = `
-- Add missing last_practiced_at column to user_topic_state table
ALTER TABLE user_topic_state 
ADD COLUMN IF NOT EXISTS last_practiced_at TIMESTAMP WITH TIME ZONE;

-- Note: time_taken_seconds already exists in reviews table, so no change needed there
`;

console.log('Run this SQL in your Supabase SQL Editor:');
console.log(sql);
