import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { User } from "@/types/user";
import { useEffect, useState } from "react";

export default function SuggestedFriends() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<User[]>([]);
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
  return (
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Suggested Friends</h3>
          <div className="space-y-3">
            {recommendations.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                  <span className="text-sm">{user.username}</span>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-700">Follow</button>
              </div>
            ))}
          </div>
        </div>
  );
}
