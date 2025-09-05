"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      router.push('/login');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !isAuthenticated) {
    return null; // Redirect handled by useAuth
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
}