"use client";
import { Notification } from "@/types/notification";
import { useState, useEffect, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";
import NotificationItem, { ProcessedNotification } from "@/components/NotificationItem";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const [fetching, setFetching] = useState(false); // Prevent concurrent fetches
  const [nextCursor, setNextCursor] = useState<string| null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async ( cursor = nextCursor) => {
    if (fetching ||  !hasMore) return; // Block concurrent/unnecessary fetches
    setFetching(true);
    try {
      const param = `cursorCreatedAt=${encodeURIComponent(cursor || '')}`;
      let apiUrl = `/api/protected/notification`;
      
      apiUrl += `?${param}`;
      const response = await fetchWithAuth(apiUrl);
      const { notifications: newNotifications, nextCursor: newCursor } = await response.json();
    
        setNotifications((prevNotification) => {
          const allNotification = [...prevNotification, ...newNotifications];
          const uniqueNotification = Array.from(new Map(allNotification.map(notification => [notification.id, notification])).values());
          return uniqueNotification.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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


  useEffect(() => {
    // Reset state whenever the feed type changes
    setNotifications([]);
    setNextCursor(null); // Important to reset cursor
    setHasMore(true);
    setLoading(true); // Set loading to true to trigger the fetch effect
  }, []);

  // This effect triggers the initial fetch after the state has been reset.
  useEffect(() => {
    if (loading && notifications.length === 0) {
      // Temporarily disable InfiniteScroll's fetcher to prevent race conditions
      setHasMore(false); 
      fetchNotifications(null);
    }
  }, [loading, notifications.length]);

  const processedNotifications = useMemo(() => {
    const groupNotifications = (
      notifications: Notification[],
      type: Notification["type"],
      keySelector: (n: Notification) => string | null
    ): ProcessedNotification[] => {
      const groups = new Map<string, Notification[]>();

      const filteredNotifications = notifications.filter(n => n.type === type);

      filteredNotifications.forEach(n => {
        const key = keySelector(n);
        if (key) {
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(n);
        }
      });

      const result: ProcessedNotification[] = [];
      groups.forEach(group => {
        const [first, ...others] = group;
        if (others.length > 0) {
          result.push({ ...first, otherUsers: others });
        } else {
          result.push(first);
        }
      });
      return result;
    };

    const otherNotifications = notifications.filter(n => n.type !== 'profile_like' && n.type !== 'post_like');
    const profileLikes = groupNotifications(notifications, 'profile_like', n => 'profile_likes');
    const postLikes = groupNotifications(notifications, 'post_like', n => n.postId);
    return [...otherNotifications, ...profileLikes, ...postLikes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
      </div>
      <div>
        <InfiniteScroll
          dataLength={processedNotifications.length}
          next={() => fetchNotifications(nextCursor)}
          hasMore={hasMore}
          loader={
            <div className="text-center py-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent" />
            </div>
          }
          endMessage={
            notifications.length > 0 ? (
              <p className="text-center text-gray-500 py-6">You&apos;ve seen all notifications.</p>
            ) : null
          }
        >
          {processedNotifications.map((notification) => (
            <div key={notification.id} className="border-b border-gray-100 last:border-b-0">
              <NotificationItem notification={notification} />
            </div>
          ))}
        </InfiniteScroll>
      </div>

      {error && (
        <div className="text-center text-red-500">{error}</div>
      )}
    </div>
  );
}