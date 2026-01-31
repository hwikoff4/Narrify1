/**
 * Supabase Client
 * Browser-side Supabase client
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@narrify/shared';

export function createClient() {
  return createClientComponentClient<Database>();
}
