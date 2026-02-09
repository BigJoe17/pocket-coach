 -- Call Logs Schema for Pocket Coach
-- Run this in your Supabase SQL Editor

-- Create call_logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  coach_id TEXT NOT NULL,
  call_start TIMESTAMPTZ DEFAULT NOW(),
  call_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  vapi_call_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own call logs
CREATE POLICY "Users can view own calls" ON call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calls" ON call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls" ON call_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Create a view for call statistics
CREATE OR REPLACE VIEW user_call_stats AS
SELECT 
  user_id,
  coach_id,
  COUNT(*) as total_calls,
  SUM(duration_seconds) as total_duration_seconds,
  AVG(duration_seconds) as avg_duration_seconds,
  MAX(call_start) as last_call_at
FROM call_logs
WHERE status = 'completed'
GROUP BY user_id, coach_id;

-- Grant access to the view
GRANT SELECT ON user_call_stats TO authenticated;
