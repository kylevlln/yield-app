'use client'

import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

/**
 * Single shared browser Supabase client.
 * Both api.ts and auth.ts import this so there is exactly ONE auth session
 * and ONE set of Realtime sockets (previously each module created its own).
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
