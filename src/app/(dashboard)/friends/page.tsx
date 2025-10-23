"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import Image from "next/image";
import { User } from "@/types/user";
import { FriendshipStatus, Profile } from "@/types/profile";
import Link from "next/link";
import AddFriendButton from "@/components/profile/AddFriendButton";
import ProfileLikeButton from "@/components/profile/ProfileLikeButton";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("received-requests");
  const [friends, setFriends] = useState<Profile[]>([]);
  const [sentRequests, setSentRequests] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleFriendshipChange = (
    userId: string,
    newStatus: FriendshipStatus
  ) => {
    setFriends((prevRecommendations) =>
      prevRecommendations.map((rec) =>
        rec.userId === userId ? { ...rec, friendshipStatus: newStatus } : rec
      )
    );
  };
  const handleProfileLikeChange = (
    userId: string,
    newLikeStatus: boolean,
    newLikeCount: number
  ) => {
    setFriends((prevRecommendations) =>
      prevRecommendations.map((rec) =>
        rec.userId === userId
          ? {
              ...rec,
              profileLikeStatus: newLikeStatus,
              profileLikeCount: newLikeCount,
            }
          : rec
      )
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "friends") {
          const response = await fetchWithAuth("/api/protected/friend");
          const data = await response.json();
          setFriends(data.friends);
        } else if (activeTab === "sent-requests") {
          const response = await fetchWithAuth(
            "/api/protected/friend/getSentRequest"
          );
          const data = await response.json();
          setSentRequests(data.requests);
        } else {
          // For received requests, assuming an endpoint like this exists
          const response = await fetchWithAuth(
            "/api/protected/friend/getPendingRequest"
          );
          const data = await response.json();
          setFriends(data.requests); // reusing friends state for simplicity
        }
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-l-blue-600 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading {activeTab}...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center py-12">
          <div className="bg-red-50 rounded-lg px-6 py-4 max-w-md">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    const renderUserList = (users: Profile[]) => (
      <div className="divide-y divide-gray-100">
        {users.map((user) => (
          <div
            key={user.userId}
            className="p-4 hover:bg-gray-50 transition-colors duration-150 group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center ring-2 ring-white">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-150"
                  >
                    {user.fullName}
                  </Link>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600">
                    @{user.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AddFriendButton
                  profile={user}
                  size="medium"
                  onUpdate={(newStatus) =>
                    handleFriendshipChange(user.userId, newStatus||"none")
                  }
                />
                <ProfileLikeButton
                  profile={user}
                  onUpdate={(newLikeStatus: boolean, newLikeCount: number) =>
                    handleProfileLikeChange(
                      user.userId,
                      newLikeStatus,
                      newLikeCount
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    if (activeTab === "received-requests") {
      return friends.length > 0 ? (
        renderUserList(friends) // temporarily using friends data
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="w-full h-full text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 4.354a4 4 0 110 5.292M5 20v-2a7 7 0 0114 0v2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No friend requests
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don&apos;t have any pending friend requests at the moment
          </p>
        </div>
      );
    }

    if (activeTab === "friends") {
      return friends.length > 0 ? (
        renderUserList(friends)
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="w-full h-full text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No friends yet
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Start connecting with other users to build your network!
          </p>
        </div>
      );
    }

    if (activeTab === "sent-requests") {
      return sentRequests.length > 0 ? (
        renderUserList(sentRequests)
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg
              className="w-full h-full text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No pending requests
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You haven&apos;t sent any friend requests yet
          </p>
        </div>
      );
    }

    return null;
  };

  const tabs = [
    {
      id: "received-requests",
      label: "Received Requests",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8"
          />
        </svg>
      ),
    },
    {
      id: "sent-requests",
      label: "Sent Requests",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l-3-3m3 3l3-3"
          />
        </svg>
      ),
    },
    {
      id: "friends",
      label: "All Friends",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Friends</h1>
          <div className="text-sm text-gray-500">
            {activeTab === "friends"
              ? `${friends.length} friends`
              : activeTab === "sent-requests"
              ? `${sentRequests.length} sent`
              : `${friends.length} received`}{" "}
            {/* temporary count */}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3.5 text-sm font-medium flex-1
              transition-all duration-200 relative
              ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
              }
              before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5
              before:transition-transform before:duration-200
              ${
                activeTab === tab.id
                  ? "before:scale-x-100 before:bg-blue-600"
                  : "before:scale-x-0 hover:before:scale-x-100 before:bg-gray-200"
              }
            `}
          >
            <span
              className={`
              transition-colors duration-200
              ${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}
            `}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-100">{renderContent()}</div>
    </div>
  );
}
