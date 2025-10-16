"use client"
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchWithAuth } from './fetchWithAuth';

interface AuthState {
  currentUserId:string;
  isAuthenticated: boolean;
  isLoading: boolean; // This will be true until the initial auth check is complete
  error: string;
}

const publicPages = ['/login', '/signup'];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUserId:'',
    isLoading: true, // Start with loading true
    error: '',
  });
  const router = useRouter();
  // usePathname and useSearchParams are used to create a dependency
  // that reruns the check if the user navigates.
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Don't run auth check on public routes
    if (publicPages.includes(pathname)) {
      setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: '' });
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const checkAuth = async () => {
      try {
        const response = await fetchWithAuth('/api/auth/verify', { method: 'GET', signal });
        const data = await response.json();

        if (signal.aborted) return;

        if (data.message === 'Token valid' && data.userId) {
          setAuthState({ isAuthenticated: true, currentUserId: data.userId, isLoading: false, error: '' });
        } else {
          setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: 'Unauthorized' });
          if (!publicPages.includes(pathname)) {
            router.push('/login');
          }
        }
      } catch (error: any) {
        if (signal.aborted) return;
        console.error('Verification failed:', error.message);
        setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: 'Verification failed' });
        if (signal.aborted) {
          return;
        }
        console.error('Verification failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Verification failed';
        setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: errorMessage });
      }
    };

    checkAuth();

    setIsInitialLoad(false);
    
    return () => {
      controller.abort();
    };
  }, [pathname, router]); // Re-check auth on route change

  return authState;
};
