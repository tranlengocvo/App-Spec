'use client';

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { isSupabaseConfigured, isServiceRoleAvailable } from '@/lib/env';
import { useEffect, useState } from 'react';

export default function SetupBanner() {
  const [mounted, setMounted] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [serviceRoleAvailable, setServiceRoleAvailable] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabaseConfig = isSupabaseConfigured();
    const serviceRole = isServiceRoleAvailable();
    console.log('SetupBanner Debug:', {
      supabaseConfig,
      serviceRole,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'loaded' : 'missing'
    });
    setSupabaseConfigured(supabaseConfig);
    setServiceRoleAvailable(serviceRole);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (supabaseConfigured && serviceRoleAvailable) {
    return null; // No banner needed
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Setup Required
          </h3>
          <div className="mt-1 text-sm text-yellow-700">
            {!supabaseConfigured ? (
              <p>Supabase not configured - running in read-only mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable full functionality.</p>
            ) : !serviceRoleAvailable ? (
              <p>Service role key missing - some features may be limited. Set SUPABASE_SERVICE_ROLE_KEY for full functionality.</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            {supabaseConfigured ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={supabaseConfigured ? 'text-green-700' : 'text-red-700'}>
              Supabase
            </span>
          </div>
          <div className="flex items-center gap-1">
            {serviceRoleAvailable ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={serviceRoleAvailable ? 'text-green-700' : 'text-red-700'}>
              Service Role
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
