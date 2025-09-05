"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify', { method: 'GET' });
      const data = await response.json();
      if (data.message === 'Token valid') {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Verification request failed:', error.message);
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

  const checkAuth = async () => {
    const isTokenValid = await verifyToken();
    if (isTokenValid) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Try refreshing token
    const isRefreshed = await refreshToken();
    if (isRefreshed) {
      const isNewTokenValid = await verifyToken();
      if (isNewTokenValid) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    }

    // If refresh fails, redirect to login
    router.push('/login');
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuth();
    // Refresh token every 10 minutes for active sessions
    const interval = setInterval(refreshToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in checkAuth
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Dashboard</h2>
        <p>Welcome to your dashboard!</p>
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
