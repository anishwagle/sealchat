'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth/useAuth';
import Navbar from '@/components/Navbar';

interface Profile {
  username: string;
  email: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading, error: authError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || authError) return;

    const fetchProfile = async () => {
      try {
     

        const profileResponse = await fetch(`/api/protected/profile`, {
          method: 'GET',
        });
        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          setProfile(profileData);
        } else {
          setError(profileData.message || 'Failed to load profile');
        }
      } catch (err: any) {
        console.error('Profile fetch failed:', err.message);
        setError('Something went wrong. Please try again.');
      }
    };

    fetchProfile();
  }, [isAuthenticated, authError, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{authError || error}</p>
      </div>
    );
  }

  if (!profile) {
    return null; // Redirect handled by useAuth or fetchProfile
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Navbar/>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Username</label>
          <p className="p-2 border rounded">{profile.username}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold">Email</label>
          <p className="p-2 border rounded">{profile.email}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}