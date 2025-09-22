"use client";
import { Notification } from "@/types/notification";
import { getTimeSince } from "@/utils/dateConveter";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function NotificationComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      await fetch("/api/protected/notification/markasread", {
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
      let apiUrl = `/api/protected/notification`;
      const data = await fetch(apiUrl);
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

  const groupProfileLikes = (notifications: Notification[]) => {
    const profileLikes = notifications.filter((n) => n.type === "profile_like");
    if (profileLikes.length <= 2) return profileLikes;

    const first = profileLikes[0];
    const second = profileLikes[1];
    const others = profileLikes.slice(2);

    return [
      {
        ...first,
        sourceUsername: `${first.sourceUsername}, ${second.sourceUsername} and ${others.length} others`,
        otherUsers: others,
      },
    ];
  };

  const renderNotificationMessage = (notif: Notification) => {
    switch (notif.type) {
      case "friend_request_sent":
        return (
          <Link
            href={`/profile/${notif.sourceUsername}`}
            className="hover:underline"
          >
            <span className="font-medium">{notif.sourceUsername}</span> sent you a
            friend request
          </Link>
        );
      case "friend_request_accept":
        return (
          <Link
            href={`/profile/${notif.sourceUsername}`}
            className="hover:underline"
          >
            <span className="font-medium">{notif.sourceUsername}</span> accepted
            your friend request
          </Link>
        );
      case "profile_like":
        return (
          <div className="group/like relative">
            <span className="font-medium">
              {notif.sourceUsername} liked your profile
            </span>
            {(notif as any).otherUsers && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 invisible group-hover/like:visible">
                {(notif as any).otherUsers.map((user: Notification, i: number) => (
                  <Link
                    key={i}
                    href={`/profile/${user.sourceUsername}`}
                    className="block py-1 px-2 hover:bg-gray-100 rounded"
                  >
                    {user.sourceUsername}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const processedNotifications = notifications.reduce(
    (acc: Notification[], notif) => {
      if (notif.type === "profile_like") {
        return [...acc, ...groupProfileLikes([notif])];
      }
      return [...acc, notif];
    },
    []
  );

  return (
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
              {processedNotifications.map((notif, i) => (
                <div
                  key={i}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg
                    ${!notif.isRead ? "bg-blue-50" : "hover:bg-gray-50"}
                  `}
                >
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${!notif.isRead ? "bg-blue-100" : "bg-gray-100"}
                  `}
                  >
                    {/* Replace emojis with SVG icons */}
                    {notif.type === "friend_request_sent" && (
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    )}
                    {notif.type === "friend_request_accept" && (
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {notif.type === "profile_like" && (
                      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">
                      {renderNotificationMessage(notif)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {getTimeSince(new Date(notif.createdAt))}
                      </span>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                  </div>
                </div>
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
  );
}

