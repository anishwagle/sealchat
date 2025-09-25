"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreatePostButton from "@/components/posts/CreatePostButton";
import PostList from "@/components/posts/PostList";
import Image from "next/image";
import { useAuth } from "@/lib/auth/useAuth";

export default function Dashboard() {
  const [isPublic, setIsPublic] = useState(false);
  const { isAuthenticated, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="space-y-5">
                {/* Profile Quick View */}
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">U</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Username</h3>
                      <p className="text-sm text-gray-500">@username</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="bg-white rounded-lg p-2">
                  <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Friends
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </a>
                </nav>

                {/* Friend Suggestions */}
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-3">Suggested Friends</h3>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                          <span className="text-sm">User {i}</span>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-700">Follow</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Message */}
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-3">Quick Message</h3>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <button key={i} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                        <div className="flex-1 text-left">
                          <p className="text-sm">Friend {i}</p>
                          <p className="text-xs text-gray-500">Online</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:flex-1 space-y-5">
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
                              ? 'bg-white shadow-sm text-blue-600' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-medium">Friends</span>
                        </button>
                        <button
                          onClick={() => setIsPublic(true)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                            isPublic 
                              ? 'bg-white shadow-sm text-blue-600' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span className="text-sm font-medium">Public</span>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isPublic ? "Showing posts from everyone" : "Showing posts from your friends only"}
                      </div>
                    </div>
                  </div>
                  <PostList isProfile={false} isPublic={isPublic} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}