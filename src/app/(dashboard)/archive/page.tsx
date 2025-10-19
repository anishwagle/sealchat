"use client";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";
import Loading from "@/components/Loading";
import PostComponent from "@/components/posts/Post";

interface PostListProps {
  userId?: string;
  isPublic?: boolean;
  isProfile?: boolean;
}

export default function PostList({
  userId,
  isPublic,
  isProfile,
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const [fetching, setFetching] = useState(false); // Prevent concurrent fetches
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (cursor = nextCursor) => {
    setFetching(true);
    try {
      const param = `cursorCreatedAt=${encodeURIComponent(cursor || "")}`;
      let apiUrl = `/api/protected/posts/archive`;

      apiUrl += `?${param}&limit=20`;
      const response = await fetchWithAuth(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch  posts`);
      const { posts: newPosts, nextCursor: newCursor } = await response.json();
      // Deduplicate posts
      setPosts((prevPosts) => {
        const allPosts = [...prevPosts, ...newPosts];
        const uniquePosts = Array.from(
          new Map(allPosts.map((post) => [post.id, post])).values()
        );
        return uniquePosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setNextCursor(formatToMySQLDate(newCursor));
      setHasMore(!!newCursor);

      setError(null);
    } catch (err: any) {
      setError("Failed to load posts: " + err.message);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== deletedPostId)
    );
  };

  useEffect(() => {
    // Reset state whenever the feed type changes
    setPosts([]);
    setNextCursor(null); // Important to reset cursor
    setHasMore(true);
    setLoading(true); // Set loading to true to trigger the fetch effect
  }, [userId, isPublic, isProfile]);

  // This effect triggers the initial fetch after the state has been reset.
  useEffect(() => {
    if (loading && posts.length === 0) {
      // Temporarily disable InfiniteScroll's fetcher to prevent race conditions
      setHasMore(false);
      fetchPosts(null);
    }
  }, [loading, posts.length]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Archived Posts</h2>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg">
            <svg
              className="w-4 h-4 text-amber-600"
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
            <span className="text-sm text-amber-800">
              Posts are permanently deleted after 30 days
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loading message="Loading archived posts..." fullScreen={false} />
              </div>
            </div>
          ) : posts.length > 0 ? (
            <InfiniteScroll
              dataLength={posts.length}
              next={() => fetchPosts(nextCursor)}
              hasMore={hasMore}
              className="space-y-4"
              loader={
                <div className="py-4">
                  <Loading message="Loading more posts..." fullScreen={false} />
                </div>
              }
              endMessage={
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">
                    You've reached the end! No more archived posts to load.
                  </p>
                </div>
              }
            >
              {posts.map((post) => (
                <PostComponent
                  key={post.id}
                  {...post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </InfiniteScroll>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-24 h-24 mb-6 text-gray-200">
                <svg
                  className="w-full h-full"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 2H4C3 2 2 3 2 4v16c0 1 1 2 2 2h16c1 0 2-1 2-2V4c0-1-1-2-2-2zm-9 15H8v-3h3v3zm0-5H8V9h3v3zm0-5H8V4h3v3zm5 10h-3v-3h3v3zm0-5h-3V9h3v3zm0-5h-3V4h3v3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No Archived Posts Yet
              </h2>
              <p className="text-gray-500 max-w-sm">
                When you archive posts, they'll appear here for 30 days before
                being permanently deleted
              </p>
            </div>
          )}

          {error && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
