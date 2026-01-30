# Database Migrations

## How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (`lrcjznwqrujevyzxcxmc`)
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy the contents of the migration file you want to run
6. Paste it into the SQL Editor
7. Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

## Migration Files

### 001_api_keys.sql
**Purpose**: Creates the `api_keys` table for storing API keys

**When to run**: Run this migration if you're getting the error "Could not find the table 'public.api_keys' in the schema cache"

**What it does**:
- Creates the `api_keys` table with all necessary columns
- Sets up indexes for performance
- Configures Row Level Security (RLS) policies
- Creates the `generate_api_key()` helper function

## Troubleshooting

### "relation already exists" error
If you see this error, it means the table/index/policy already exists. This is safe to ignore - the migration uses `IF NOT EXISTS` and `IF EXISTS` clauses to handle this gracefully.

### Still getting errors after running migration?
1. Make sure you're logged in to the correct Supabase account
2. Verify you're in the correct project
3. Try refreshing your browser
4. Check that the `clients` table exists (required for the foreign key relationship)

## Need to Reset?

If you need to completely reset your database, you can run the full schema from `/supabase/schema.sql` instead. This will create all tables from scratch.

**WARNING**: This will delete all existing data. Only do this if you're starting fresh or have backed up your data.
