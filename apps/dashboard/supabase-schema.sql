-- Narrify Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_user_id)
);

-- Index for faster lookups by auth_user_id
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON clients(auth_user_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their own client record"
  ON clients FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own client record"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own client record"
  ON clients FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- =====================================================
-- TOURS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  pages JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tours_client_id ON tours(client_id);
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at DESC);

-- Enable Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tours
CREATE POLICY "Users can view their own tours"
  ON tours FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own tours"
  ON tours FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tours"
  ON tours FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tours"
  ON tours FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE auth_user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================
-- Uncomment to create a test client for the currently authenticated user
-- INSERT INTO clients (auth_user_id, name, email)
-- VALUES (auth.uid(), 'Test User', auth.email())
-- ON CONFLICT (auth_user_id) DO NOTHING;
