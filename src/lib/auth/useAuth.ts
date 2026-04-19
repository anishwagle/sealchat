"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AuthState {
  currentUserId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
}

const publicPages = ['/login', '/signup', '/', '/privacy'];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUserId: '',
    isLoading: true,
    error: '',
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error('Supabase getSession failed:', error.message);
        setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: 'Verification failed' });
        if (!publicPages.includes(pathname)) {
          router.push('/');
        }
        return;
      }

      if (session?.user) {
        setAuthState({ isAuthenticated: true, currentUserId: session.user.id, isLoading: false, error: '' });
      } else {
        setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: 'Unauthorized' });
        if (!publicPages.includes(pathname)) {
          router.push('/');
        }
      }
    };

    // Run initial check
    checkAuth();

    // Subscribe to ongoing events (e.g., magic link login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setAuthState({ isAuthenticated: true, currentUserId: session.user.id, isLoading: false, error: '' });
      } else {
        setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: 'Unauthorized' });
        if (!publicPages.includes(pathname)) {
          router.push('/');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return authState;
};
