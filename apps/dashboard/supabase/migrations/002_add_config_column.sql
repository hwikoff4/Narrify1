-- Add config column to clients table
-- This column will store user preferences including theme settings

-- Add the config column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'config'
    ) THEN
        ALTER TABLE clients
        ADD COLUMN config JSONB NOT NULL DEFAULT '{}';

        RAISE NOTICE 'Added config column to clients table';
    ELSE
        RAISE NOTICE 'Config column already exists in clients table';
    END IF;
END $$;
