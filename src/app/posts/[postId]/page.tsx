"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Post } from "@/types/post";
import PostComponent from "@/components/posts/Post";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!postId) return; // Don't fetch if postId is not available yet
    setLoading(true);
    try {
      const apiUrl = `/api/protected/posts/${postId}`;

      const data = await fetchWithAuth(apiUrl);
      const results = await data.json();
      setPost(results.post);
      setError(null);
    } catch (err: any) {
      setError("Failed to load post: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPosts();
    }
  }, [postId, fetchPosts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20">
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Home
                  </a>
                  {/* Other nav links */}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:flex-1 space-y-5">
              {loading ? (
                <div className="text-center text-gray-500 py-10">Loading post...</div>
              ) : error ? (
                <div className="text-center text-red-500 bg-white p-10 rounded-lg">{error}</div>
              ) : !post ? (
                <div className="text-center text-gray-500 bg-white p-10 rounded-lg">No post found.</div>
              ) : (
                <PostComponent key={post.id} {...post} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
