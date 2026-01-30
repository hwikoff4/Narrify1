-- Migration: Create API Keys Table
-- Run this in your Supabase SQL Editor to fix the API Keys generation error

-- ============================================================================
-- API KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domains TEXT[] DEFAULT ARRAY[]::TEXT[],
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on api_keys table
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;

-- Create RLS policies
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own API keys"
  ON api_keys FOR DELETE
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================

-- Function to generate API key (if not already exists)
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'nr_live_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
