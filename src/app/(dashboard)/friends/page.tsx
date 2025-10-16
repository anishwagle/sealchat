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
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState<Profile[]>([]);
  const [sentRequests, setSentRequests] = useState<Profile[]>([]);
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
        } else {
          const response = await fetchWithAuth("/api/protected/friend/pendingRequest");
          const data = await response.json();
          setSentRequests(data.requests);
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
        <div className="text-center py-6">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500 py-6">{error}</div>;
    }

    if (activeTab === "friends") {
      return (
        <div>
          {friends.length > 0 ? (
            <ul className="divide-y gap-5 divide-gray-200">
              {friends.map((friend) => (
                <div
                  key={friend.userId}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {friend.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link
                        href={`/profile/${friend.username}`}
                        className="font-medium text-gray-700"
                      >
                        {friend.fullName}
                      </Link>
                      <p className="text-sm text-gray-500">
                        @{friend.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                  <AddFriendButton
                    profile={friend}
                    size="medium"
                    onUpdate={(newStatus) =>
                      handleFriendshipChange(friend.userId, newStatus)
                    }
                  />
                  <ProfileLikeButton
                    profile={friend}
                    onUpdate={(newLikeStatus: boolean, newLikeCount: number) =>
                      handleProfileLikeChange(
                        friend.userId,
                        newLikeStatus,
                        newLikeCount
                      )
                    }
                  />
                  </div>
                </div>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-6">
              You have no friends yet.
            </p>
          )}
        </div>
      );
    }

    if (activeTab === "sent-requests") {
      return (
        <div>
          {sentRequests.length > 0 ? (
            <ul className="divide-y gap-5 divide-gray-200">
              {sentRequests.map((friend) => (
                <div
                  key={friend.userId}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {friend.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link
                        href={`/profile/${friend.username}`}
                        className="font-medium text-gray-700"
                      >
                        {friend.fullName}
                      </Link>
                      <p className="text-sm text-gray-500">
                        @{friend.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                  <AddFriendButton
                    profile={friend}
                    size="medium"
                    onUpdate={(newStatus) =>
                      handleFriendshipChange(friend.userId, newStatus)
                    }
                  />
                  <ProfileLikeButton
                    profile={friend}
                    onUpdate={(newLikeStatus: boolean, newLikeCount: number) =>
                      handleProfileLikeChange(
                        friend.userId,
                        newLikeStatus,
                        newLikeCount
                      )
                    }
                  />
                  </div>
                </div>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-6">
              You have no sent requests yet.
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Friends</h1>
      </div>
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 p-4 text-center font-medium ${
            activeTab === "friends"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("friends")}
        >
          Friends
        </button>
        <button
          className={`flex-1 p-4 text-center font-medium ${
            activeTab === "sent-requests"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("sent-requests")}
        >
          Sent Requests
        </button>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}
