"use client";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import PostComponent from "./Post";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";

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
  const [nextCursor, setNextCursor] = useState<string| null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [lastKnownCreatedAt, setLastKnownCreatedAt] = useState('1970-01-01 00:00:00');

  const fetchPosts = async (direction = 'older', cursor = nextCursor) => {
    if (fetching || (direction === 'older' && !hasMore)) return; // Block concurrent/unnecessary fetches
    setFetching(true);
    try {
      const param = direction === 'older'
        ? `cursorCreatedAt=${encodeURIComponent(cursor || '')}`
        : `sinceCreatedAt=${encodeURIComponent(lastKnownCreatedAt)}`;
      let apiUrl = `/api/protected/posts`;
      if (isProfile) {
        apiUrl += `/user`;
        if (userId) apiUrl += `/${userId}`;
      } else if (isPublic) {
        apiUrl += `/public`;
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
      if (direction === 'older') {
        setPosts((prevPosts) => {
          const allPosts = [...prevPosts, ...newPosts];
          const uniquePosts = Array.from(new Map(allPosts.map(post => [post.id, post])).values());
          return uniquePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        setNextCursor(formatToMySQLDate(newCursor));
        setHasMore(!!newCursor);
      } else {
        setPosts((prevPosts) => {
          const allPosts = [...newPosts, ...prevPosts];
          const uniquePosts = Array.from(new Map(allPosts.map(post => [post.id, post])).values());
          return uniquePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        setNewPostsCount(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Update lastKnownCreatedAt after state update
      setPosts(currentPosts => {
        if (currentPosts.length > 0) setLastKnownCreatedAt(formatToMySQLDate(currentPosts[0].createdAt));
        return currentPosts;
      });
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
    // Reset state whenever the feed type changes
    setPosts([]);
    setNextCursor(null); // Important to reset cursor
    setHasMore(true);
    setLastKnownCreatedAt('1970-01-01 00:00:00');
    setNewPostsCount(0);
    setLoading(true); // Set loading to true to trigger the fetch effect
  }, [userId, isPublic, isProfile]);

  // This effect triggers the initial fetch after the state has been reset.
  useEffect(() => {
    if (loading && posts.length === 0) {
      // Temporarily disable InfiniteScroll's fetcher to prevent race conditions
      setHasMore(false); 
      fetchPosts('older', null);
    }
  }, [loading, posts.length]);
  useEffect(() => {
    const interval = setInterval(checkForNewPosts, 30000);
    return () => clearInterval(interval);
  }, [lastKnownCreatedAt, userId, isPublic, isProfile]);
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
        className="space-y-4"
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