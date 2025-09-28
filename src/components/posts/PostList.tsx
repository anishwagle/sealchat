"use client";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import PostComponent from "./Post";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";

interface PostListProps {
  userId?: string;
  isPublic?: boolean;
  isProfile?: boolean;
}

export default function PostList({ userId, isPublic, isProfile }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const [fetching, setFetching] = useState(false); // Prevent concurrent fetches
  const [nextCursor, setNextCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [lastKnownCreatedAt, setLastKnownCreatedAt] = useState('1970-01-01 00:00:00');
  const [lastKnownId, setLastKnownId] = useState<string | null>(null);

  const fetchPosts = async (direction = 'older', cursor = nextCursor) => {
    if (fetching || (direction === 'older' && !hasMore)) return; // Block concurrent/unnecessary fetches
    setFetching(true);
    try {
      const param = direction === 'older'
        ? `cursorCreatedAt=${encodeURIComponent(cursor?.created_at || '')}`
        : `sinceCreatedAt=${encodeURIComponent(lastKnownCreatedAt)}`;
      let apiUrl = `/api/protected/posts`;
      if (isPublic) apiUrl += `/public`;
      else if (isProfile) {
        apiUrl += `/user`;
        if (userId) apiUrl += `/${userId}`;
      }
      
      apiUrl += `?${param}&limit=20`;
      const response = await fetchWithAuth(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch ${direction} posts`);
      const { posts: newPosts, nextCursor: newCursor } = await response.json();
      // Deduplicate posts
      const existingIds = new Set(posts.map(p => p.id));
      const uniqueNewPosts:Post[] = newPosts.filter((post: Post) => !existingIds.has(post.id));

      if (direction === 'older') {
        setPosts((prev) => [...prev, ...uniqueNewPosts]);
        setNextCursor(newCursor);
        setHasMore(!!newCursor);
        if (posts.length === 0 && uniqueNewPosts.length > 0) {
          setLastKnownCreatedAt(`${uniqueNewPosts[0].createdAt}`);
          setLastKnownId(uniqueNewPosts[0].id);
        }
      } else {
        setPosts((prev) => [...uniqueNewPosts, ...prev]);
        if (uniqueNewPosts.length > 0) {
          setLastKnownCreatedAt(`${uniqueNewPosts[0].createdAt}`);
          setLastKnownId(uniqueNewPosts[0].id);
        }
        setNewPostsCount(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setError(null);
    } catch (err: any) {
      setError("Failed to load posts: " + err.message);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const checkForNewPosts = async () => {
    if (fetching) return;
    try {
      let apiUrl = `/api/protected/posts`;
      if (isPublic) apiUrl += `/public`;
      else if (isProfile) apiUrl += `/user`;
      if (isProfile && userId) apiUrl += `/${userId}`;
      
      apiUrl += `?sinceCreatedAt=${encodeURIComponent(lastKnownCreatedAt)}`;
      const response = await fetchWithAuth(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to check new posts');
      const { posts: newPosts } = await response.json();
      setNewPostsCount(newPosts.length);
    } catch (error) {
      console.error('Error checking new posts:', error);
    }
  };

  useEffect(() => {
    setPosts([]); // Reset posts on prop change
    setNextCursor(null);
    setHasMore(true);
    setLastKnownCreatedAt('1970-01-01 00:00:00');
    setLastKnownId(null);
    setLoading(true);
    // Let the InfiniteScroll component handle the initial fetch
    // by ensuring it has a clean slate to work with.
    // We set loading to false to signal that initialization is complete.
    setLoading(false);
  }, [userId, isPublic, isProfile]);

  useEffect(() => {
    const interval = setInterval(checkForNewPosts, 30000);
    return () => clearInterval(interval);
  }, [lastKnownCreatedAt, lastKnownId, userId, isPublic, isProfile]);

  // This handles the very first fetch when the component is ready.
  useEffect(() => {
    if (!loading && posts.length === 0) {
      fetchPosts('older', null);
    }
  }, [loading]);
  return (
    <div className="space-y-4">
      {newPostsCount > 0 && (
        <div
          onClick={() => fetchPosts('newer')}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-lg cursor-pointer shadow-md hover:bg-blue-600 z-50"
        >
          See {newPostsCount} new post{newPostsCount > 1 ? 's' : ''}
        </div>
      )}

      <InfiniteScroll
        dataLength={posts.length}
        next={() => fetchPosts('older', nextCursor)}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent" />
          </div>
        }
        endMessage={
          posts.length > 0 ? (
            <p className="text-center text-gray-500">No more posts to load.</p>
          ) : null
        }
      >
        {posts.map((post) => (
          <PostComponent key={post.id} {...post} />
        ))}
      </InfiniteScroll>

      {error && (
        <div className="text-center text-red-500">{error}</div>
      )}
    </div>
  );
}