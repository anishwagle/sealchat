"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Post } from "@/types/post";
import PostComponent from "@/components/posts/Post";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

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
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            

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
    </div>
  );
}
