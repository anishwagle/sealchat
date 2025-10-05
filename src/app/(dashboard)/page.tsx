"use client";
import { useEffect, useState } from "react";
import CreatePostButton from "@/components/posts/CreatePostButton";
import PostList from "@/components/posts/PostList";
import { useAuth } from "@/lib/auth/useAuth";
import Loading from "@/components/Loading";

export default function Dashboard() {
  const [isPublic, setIsPublic] = useState(false);
  const { isAuthenticated, isLoading, error: authError } = useAuth();
  useEffect(() => {
    if (!isAuthenticated || authError) return;
  }, [isAuthenticated, isLoading]); // Dependencies that trigger fetching.
if (isLoading) {
    return (
      <Loading message="Authenticating please wait" fullScreen={true}/>
    );
  }
  return (
    // The parent layout now handles the main structure, so we only need a fragment here.
    <>
      <div className="bg-white rounded-lg p-4">
        <CreatePostButton />
      </div>

      <div className="bg-white rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-medium text-gray-900">Your Feed</h2>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    !isPublic
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Friends</span>
                </button>
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    isPublic
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span className="text-sm font-medium">Public</span>
                </button>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isPublic
                  ? "Showing posts from everyone"
                  : "Showing posts from your friends only"}
              </div>
            </div>
          </div>
          <PostList isProfile={false} isPublic={isPublic} />
        </div>
      </div>
    </>
  );
}