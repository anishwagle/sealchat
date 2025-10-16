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
    <div className="bg-white rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-medium text-gray-900">Archived Post</h2>
          <div className="flex flex-col items-end gap-2">
            
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
              </svg>Archived Post gets deleted permanently after 30 days
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {fetching ? (
            <Loading message="Loading post..." fullScreen={false} />
          ) : posts.length > 0 ? (
            <InfiniteScroll
              dataLength={posts.length}
              next={() => fetchPosts(nextCursor)}
              hasMore={hasMore}
              className="space-y-4"
              loader={<Loading message="Loading post..." fullScreen={false} />}
              endMessage={
                posts.length > 0 ? (
                  <p className="text-center text-gray-500">
                    No more posts to load.
                  </p>
                ) : null
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Nothing to see here &#40;yet&#41;!
              </h2>
            </div>
          )}

          {error && <div className="text-center text-red-500">{error}</div>}
        </div>
      </div>
    </div>
  );
}
