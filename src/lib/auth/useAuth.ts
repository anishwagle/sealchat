import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  userId:string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId:'',
    isLoading: true,
    error: '',
  });
  const router = useRouter();

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify', { method: 'GET' });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Verification failed:', error.message);
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await response.json();
      if (data.message === 'Token refreshed') {
        console.log('Access token refreshed');
        return true;
      }
      console.log('Refresh failed:', data.message);
      return false;
    } catch (error: any) {
      console.error('Refresh request failed:', error.message);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const data = await verifyToken();
      if (data.message === 'Token valid') {
        setAuthState({ isAuthenticated: true,userId:data.userId, isLoading: false, error: '' });
        return;
      }

      const isRefreshed = await refreshToken();
      if (isRefreshed && (data.message === 'Token valid')) {
        setAuthState({ isAuthenticated: true,userId:data.userId, isLoading: false, error: '' });
        return;
      }

      setAuthState({ isAuthenticated: false,userId:data.userId, isLoading: false, error: 'Unauthorized' });
      router.push('/login');
    };

    checkAuth();

    // Refresh token every 10 minutes
    const interval = setInterval(async () => {
      const isRefreshed = await refreshToken();
      if (!isRefreshed) {
        setAuthState(prev => ({ ...prev, isAuthenticated: false, error: 'Session expired' }));
        router.push('/login');
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  return authState;
};