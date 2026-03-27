/**
 * Authentication Utilities
 * Session management and auth helpers
 */

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';
import { errors } from './api-error-handler';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'superadmin';
  institutionId?: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const SESSION_COOKIE = 'medlog_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie) {
      return null;
    }

    const session: Session = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      await clearSession();
      return null;
    }

    return session;
  } catch (error) {
    await clearSession();
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw errors.unauthorized('Authentication required');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw errors.forbidden('Admin access required');
  }
  return user;
}

export async function requireSuperAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'superadmin') {
    throw errors.forbidden('Super admin access required');
  }
  return user;
}

export async function createSession(user: User, accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  
  const session: Session = {
    user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + SESSION_DURATION,
  };

  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function refreshSession(): Promise<Session | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  try {
    const env = getEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: session.refreshToken,
    });

    if (error || !data.session) {
      await clearSession();
      return null;
    }

    await createSession(
      session.user,
      data.session.access_token,
      data.session.refresh_token
    );

    return {
      ...session,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: Date.now() + SESSION_DURATION,
    };
  } catch (error) {
    await clearSession();
    return null;
  }
}

export function getSupabaseClient(accessToken?: string) {
  const env = getEnv();
  
  if (accessToken) {
    return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
