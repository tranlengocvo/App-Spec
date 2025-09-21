'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, getCurrentUser, isUserWhitelisted, canUserCreateSwaps } from './auth';
import { supabase } from './supabaseClient';

const AuthContext = createContext<AuthState>({
  user: null,
  isWhitelisted: false,
  canCreateSwaps: false,
  loading: true,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isWhitelisted: false,
    canCreateSwaps: false,
    loading: true,
  });

  useEffect(() => {
    async function loadAuthState() {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          const isWhitelisted = await isUserWhitelisted(user.email);
          const canCreateSwaps = canUserCreateSwaps(user);
          
          setAuthState({
            user,
            isWhitelisted,
            canCreateSwaps,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            isWhitelisted: false,
            canCreateSwaps: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({
          user: null,
          isWhitelisted: false,
          canCreateSwaps: false,
          loading: false,
        });
      }
    }

    loadAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await loadAuthState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}
