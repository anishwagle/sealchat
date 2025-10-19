"use client";
import { Notification } from "@/types/notification";
import { useState, useEffect, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";
import { useProcessedNotifications } from "@/hooks/useProcessedNotifications";
import NotificationItem from "@/components/NotificationItem";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const [fetching, setFetching] = useState(false); // Prevent concurrent fetches
  const [nextCursor, setNextCursor] = useState<string| null>(null);
  const [hasMore, setHasMore] = useState(true);
  const processedNotifications = useProcessedNotifications(notifications);
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
          return uniqueNotification.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Recent activity from people you follow and your network</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            onClick={() => { /* preserve client-side-only UI action: noop */ }}
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="p-3 min-h-[160px]">
        {loading && processedNotifications.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                </div>
                <div className="h-3 w-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
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
              processedNotifications.length > 0 ? (
                <p className="text-center text-gray-500 py-6">You&apos;ve seen all notifications.</p>
              ) : null
            }
          >
            <ul className="divide-y divide-gray-100">
              {processedNotifications.map((notification) => (
                <li key={notification.id} className="px-2 py-3 hover:bg-gray-50">
                  <NotificationItem notification={notification} />
                </li>
              ))}
            </ul>
          </InfiniteScroll>
        )}

        {!loading && processedNotifications.length === 0 && (
          <div className="text-center py-12">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-gray-300">
              <path d="M12 2a7 7 0 00-7 7v3l-1 2v1h16v-1l-1-2V9a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-gray-700 font-medium">You're all caught up</p>
            <p className="text-sm text-gray-500 mt-1">When new activity happens, you&apos;ll see it here.</p>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 border-t border-red-100 bg-red-50 text-red-700 text-sm">{error}</div>
      )}
    </div>
  );
}