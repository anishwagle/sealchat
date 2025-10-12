import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { useEffect, useState } from "react";
import AddFriendButton from "../profile/AddFriendButton";
import { FriendshipStatus, Profile } from "@/types/profile";
import Link from "next/link";

export default function SuggestedFriends() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      let apiUrl = `/api/protected/friend/recommend`;

      const data = await fetchWithAuth(apiUrl, { method: "GET" });
      const results = await data.json();
      const recommendations = results.recommendations || [];

      setRecommendations(recommendations);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleFriendshipChange = (
    userId: string,
    newStatus: FriendshipStatus
  ) => {
    setRecommendations((prevRecommendations) =>
      prevRecommendations.map((rec) =>
        rec.userId === userId ? { ...rec, friendshipStatus: newStatus } : rec
      )
    );
  };
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-medium text-sm text-gray-700 mb-3">
        Suggested Friends
      </h3>
      <div className="space-y-3">
        {recommendations.map((profile) => (
          <div key={profile.userId} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-semibold ring-1 ring-blue-100">
              {profile.username[0].toUpperCase()}
            </div>
              <Link
                href={`/profile/${profile.username}`}
                className="font-medium text-gray-700"
              >
                {profile.username}
              </Link>
            </div>
            <AddFriendButton
              profile={profile}
              size="medium"
              onUpdate={(newStatus) =>
                handleFriendshipChange(profile.userId, newStatus)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
