import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { useEffect, useState } from "react";
import { Profile } from "@/types/profile";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileQuickView() {
  const [profile, setProfile] = useState<Profile>();
  const router = useRouter();
  const fetchProfile = async () => {
      try {
        const profileResponse = await fetchWithAuth(`/api/protected/profile`, {
          method: "GET",
        });
        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          if(!!!profileData.profile){
            router.push(`/signup?initialStep=2`)
          }
          setProfile(profileData.profile);
        } 
      } catch (err: any) {
        console.error("Profile fetch failed:", err.message);
      }
    };
  useEffect(() => {
    fetchProfile();
  }, []);


  return  (
   <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-blue-600 font-medium">{profile?.username[0].toUpperCase()}</span>
            </div>
            <div>
              <Link
                href={`/profile`}
                className="font-medium text-gray-700"
              >
                {profile?.fullName}
              </Link>
              <p className="text-sm text-gray-500">@{profile?.username}</p>
            </div>
          </div>
        </div>
  ) ;
}
