import { createClient } from '@supabase/supabase-js';
import { publicEnv, serverEnv } from './env';

// Client-side Supabase client
export const supabase = createClient(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

// Server-side Supabase client with service role
export const supabaseAdmin = serverEnv.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;
