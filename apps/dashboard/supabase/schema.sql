-- Narrify Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Subscription
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),

  -- Auth
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on email
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_auth_user_id ON clients(auth_user_id);

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
CREATE INDEX idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_active ON api_keys(active);

-- ============================================================================
-- TOURS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pages JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tours_client_id ON tours(client_id);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  tour_id TEXT,
  step_id TEXT,
  user_id TEXT,
  session_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_analytics_events_client_id ON analytics_events(client_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(type);
CREATE INDEX idx_analytics_events_tour_id ON analytics_events(tour_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own client data"
  ON clients FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own client data"
  ON clients FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- API Keys policies
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

-- Tours policies
CREATE POLICY "Users can view their own tours"
  ON tours FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own tours"
  ON tours FOR INSERT
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own tours"
  ON tours FOR UPDATE
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own tours"
  ON tours FOR DELETE
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

-- Analytics events policies
CREATE POLICY "Users can view their own analytics"
  ON analytics_events FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE auth_user_id = auth.uid()
  ));

-- Service role can insert analytics (from API)
CREATE POLICY "Service role can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'nr_live_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- No initial data needed - clients are created on signup
