import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchWithAuth } from './fetchWithAuth';

interface AuthState {
  currentUserId:string;
  isAuthenticated: boolean;
  isLoading: boolean; // This will be true until the initial auth check is complete
  error: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUserId:'',
    isLoading: true, // Start with loading true
    error: '',
  });
  const router = useRouter();
  const pathname = usePathname();
  const didInitialCheck = useRef(false);

  const verifyToken = async () => {
    try {
      // Assume this API endpoint uses the httpOnly cookie to verify the session
      const response = await fetchWithAuth('/api/auth/verify', { method: 'GET' });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Verification failed:', error.message);
      return { message: 'Verification request failed' };
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Prevent running the check twice in dev due to Strict Mode
    if (didInitialCheck.current) {
      return;
    }
    didInitialCheck.current = true;
    const checkAuth = async () => {
      let data = await verifyToken();
      
      if (!isMounted) return;

      // After attempting verification and refresh, update the state
      if (data.message === 'Token valid' && data.userId) {
        setAuthState({ isAuthenticated: true, currentUserId: data.userId, isLoading: false, error: '' });
      } else {
        setAuthState({ isAuthenticated: false, currentUserId: '', isLoading: false, error: 'Unauthorized' });
        // Only redirect if not on a public route already
        if (pathname !== '/login' && pathname !== '/signup') {
          router.push('/login');
        }
      }
    };

    checkAuth();

    // Cleanup function to clear interval and prevent state updates on unmounted components
    return () => {
      isMounted = false;
    };
    // The dependency array is empty, so this effect runs only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependencies empty to run only on initial mount

  // This effect handles redirection after the initial auth check is done.
  useEffect(() => {
    // Don't redirect while loading.
    if (authState.isLoading) {
      return;
    }

    if (!authState.isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [authState.isAuthenticated, authState.isLoading, pathname, router]);

  return authState;
};
