/**
 * Supabase Server Client
 * Server-side Supabase client for API routes and Server Components
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@narrify/shared';

export function createClient() {
  return createServerComponentClient<Database>({
    cookies,
  });
}
