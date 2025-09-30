"use client";
import { Notification } from "@/types/notification";
import { getTimeSince } from "@/utils/dateConveter";
import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import Link from "next/link";
import NotificationItem, { ProcessedNotification } from "./NotificationItem";

export default function NotificationComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;


  const markAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      await fetchWithAuth("/api/protected/notification/markasread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });

      setReadNotificationIds((prev) => [...prev, ...unreadIds]);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read");
    }
  };

  const handleDropdownOpen = () => {
    setIsOpen((prev) => !prev);
    if (unreadCount > 0) {
      markAsRead();
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let apiUrl = `/api/protected/notification?limit=${5}`;
      const data = await fetchWithAuth(apiUrl);
      const results = await data.json();
      setNotifications(results.notifications.map((x: Notification) => x));
      setError(null);
    } catch (err: any) {
      setError("Failed to load notification: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Changed to 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const processedNotifications = useMemo(() => {
    if (loading) return [];

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
  }, [notifications, loading]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleDropdownOpen}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            className={`h-5 w-5 ${unreadCount > 0 ? "text-blue-500" : "text-gray-500"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v1c0 1.7 1.3 3 3 3s3-1.3 3-3v-1"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center 
                           text-xs font-medium text-white bg-blue-500 rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div
          className={`
            absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-100
            transform transition-all duration-200
            ${isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"}
            max-h-[80vh] overflow-y-auto
          `}
        >
          <div className="sticky top-0 bg-white p-4 border-b border-gray-100 z-10">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                Notifications
                {loading && (
                  <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium 
                           hover:bg-blue-50 px-3 py-1 rounded-full transition-colors duration-200"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {processedNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onItemClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <Link
                href="/notifications"
                className="block mt-4 text-center py-2.5 text-sm text-gray-700 hover:text-gray-900 
                         font-medium"
              >
                View All
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
