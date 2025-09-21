import { supabase } from './supabaseClient';
import { serverEnv } from './env';

export interface User {
  id: string;
  email: string;
  name: string;
  major?: string;
  year?: string;
  email_verified: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isWhitelisted: boolean;
  canCreateSwaps: boolean;
  loading: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function isUserWhitelisted(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('directory_whitelist')
      .select('email')
      .eq('email', email)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return false;
  }
}

export function canUserCreateSwaps(user: User | null): boolean {
  if (!user) return false;
  
  // Check email domain
  const emailDomain = user.email.split('@')[1];
  if (emailDomain !== serverEnv.ALLOWED_EMAIL_DOMAIN) {
    return false;
  }
  
  // Check email verification
  if (!user.email_verified) {
    return false;
  }
  
  return true;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string, name: string, major?: string, year?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data, error };
  }

  if (data.user) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name,
        major,
        year,
        email_verified: false,
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
