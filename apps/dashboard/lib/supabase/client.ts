/**
 * Supabase Client
 * Browser-side Supabase client
 * Falls back to mock client in demo mode
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@narrify/shared';
import { createMockClient } from './mock-client';

export function createClient() {
  // Use mock client if Supabase is not configured (demo mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Running in DEMO MODE - Supabase not configured. Using mock data.');
    return createMockClient() as any;
  }

  return createClientComponentClient<Database>();
}
