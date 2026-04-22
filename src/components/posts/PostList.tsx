"use client";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import PostComponent from "./Post";
import PostSkeleton from "./PostSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";
import Link from "next/link";
import { HiOutlineSparkles } from "react-icons/hi2";

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
      const response = await fetchWithAuth(apiUrl);
      if (!response.ok) throw new Error('Failed to check new posts');
      const { posts: newPosts } = await response.json();
      setNewPostsCount(newPosts.length);
    } catch (error) {
      console.error('Error checking new posts:', error);
    }
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
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
    <div className="space-y-6">
      {/* New Posts Notification */}
      {newPostsCount > 0 && (
        <button
          onClick={() => fetchPosts('newer')}
          className="w-full fixed top-24 left-1/2 transform -translate-x-1/2 max-w-2xl mx-auto px-4 z-40"
        >
          <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium">
            <HiOutlineSparkles className="w-5 h-5" />
            See {newPostsCount} new post{newPostsCount > 1 ? 's' : ''}
          </div>
        </button>
      )}

      {/* Loading State - Initial Load */}
      {loading && posts.length === 0 ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <InfiniteScroll
          dataLength={posts.length}
          next={() => fetchPosts('older', nextCursor)}
          hasMore={hasMore}
          className="space-y-6"
          loader={<PostSkeleton key="loader" />}
          endMessage={
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No more posts to load.</p>
            </div>
          }
        >
          {posts.map((post) => (
            <PostComponent key={post.id} {...post} onPostDeleted={handlePostDeleted} />
          ))}
        </InfiniteScroll>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="mb-4">
            <HiOutlineSparkles className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nothing to see here (yet)!
          </h2>
          <p className="text-muted-foreground max-w-md text-sm mb-6">
            Your feed is empty. Start by adding friends or exploring the{" "}
            <span className="font-medium">Public</span> tab to see what others are sharing.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}