"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import Navbar from "@/components/Navbar";
import CreatePostButton from "@/components/posts/CreatePostButton";
import PostList from "@/components/posts/PostList";

export default function Dashboard() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !isAuthenticated) {
    return null; // Redirect handled by useAuth
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Dashboard</h2>
            <p>Welcome to your dashboard!</p>
            <CreatePostButton/>
            <PostList isPublic={true}/>
          </div>
        </div>
      </main>
    </div>
  );
}