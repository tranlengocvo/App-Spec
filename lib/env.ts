import { z } from 'zod';

const envSchema = z.object({
  // Public environment variables
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_PURDUE_OData_BASE: z.string().url().default('https://api.purdue.io/odata'),
  
  // Server-only environment variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ALLOWED_EMAIL_DOMAIN: z.string().default('purdue.edu'),
  PURDUE_USE_SEED_FALLBACK: z.string().transform(val => val === 'true').default('true'),
  ENABLE_LOAD_DEMO_BUTTON: z.string().transform(val => val === 'true').default('true'),
  RATE_LIMIT_CREATE_PER_DAY: z.string().transform(Number).default('3'),
  RATE_LIMIT_OFFER_PER_HOUR: z.string().transform(Number).default('10'),
  RATE_LIMIT_DM_PER_HOUR: z.string().transform(Number).default('20'),
});

const env = envSchema.parse(process.env);

// Public environment variables (safe to expose to client)
export const publicEnv = {
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_PURDUE_OData_BASE: env.NEXT_PUBLIC_PURDUE_OData_BASE,
} as const;

// Server-only environment variables
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  ALLOWED_EMAIL_DOMAIN: env.ALLOWED_EMAIL_DOMAIN,
  PURDUE_USE_SEED_FALLBACK: env.PURDUE_USE_SEED_FALLBACK,
  ENABLE_LOAD_DEMO_BUTTON: env.ENABLE_LOAD_DEMO_BUTTON,
  RATE_LIMIT_CREATE_PER_DAY: env.RATE_LIMIT_CREATE_PER_DAY,
  RATE_LIMIT_OFFER_PER_HOUR: env.RATE_LIMIT_OFFER_PER_HOUR,
  RATE_LIMIT_DM_PER_HOUR: env.RATE_LIMIT_DM_PER_HOUR,
} as const;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Helper to check if service role is available
export const isServiceRoleAvailable = () => {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
};
