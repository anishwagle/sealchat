"use client";
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { useEffect } from 'react';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <Loading message='Loading...' fullScreen={true} />;
    }

    if (isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    return null;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
