
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { useEffect, useState } from "react";
import AddFriendButton from "../profile/AddFriendButton";
import { FriendshipStatus, Profile } from "@/types/profile";
import Link from "next/link";
import ProfileLikeButton from "../profile/ProfileLikeButton";

export default function SuggestedProfiles() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const apiUrl = `/api/protected/friend/recommendProfile`;

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


  const handleProfileLikeChange = (userId:string, newLikeStatus: boolean, newLikeCount: number) => {
    setRecommendations((prevRecommendations) =>
      prevRecommendations.map((rec) =>
        rec.userId === userId ? { ...rec, profileLikeStatus: newLikeStatus, profileLikeCount: newLikeCount } : rec
      )
    );
  };
  return (
    (recommendations.length>0?
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-medium text-sm text-gray-700 mb-3">
        Profiles Your Friends Like
      </h3>
      <div className="space-y-3">
        {recommendations.map((profile) => (
          <div key={profile.userId} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{profile.username[0].toUpperCase()}</span>
                </div>
                <div>
                  <Link
                  href={`/profile/${profile.username}`}
                  className="font-medium text-gray-700"
                >
                  {profile.fullName}
                </Link>
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                </div>
              </div>
            <ProfileLikeButton
              profile={profile}
              onUpdate={(newLikeStatus: boolean, newLikeCount: number) =>
                handleProfileLikeChange(profile.userId, newLikeStatus,newLikeCount)
              }
            />
          </div>
        ))}
      </div>
    </div>:null)
  );
}
