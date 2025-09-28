"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile as ProfileType } from "@/types/profile";
import { useAuth } from "@/lib/auth/useAuth";
import Navbar from "@/components/Navbar";
import PostList from "@/components/posts/PostList";
import CreatePostButton from "@/components/posts/CreatePostButton";
import Snackbar from "@/components/SnackBar";
import UserListModal from "@/components/modals/UserListModal";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [error, setError] = useState("");
  const { isAuthenticated, isLoading, error: authError } = useAuth();
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsList, setFriendsList] = useState<{ username: string }[]>([]);
  const [showProfileLikesModal, setShowProfileLikesModal] = useState(false);
  const [profileLikesList, setProfileLikesList] = useState<{ username: string }[]>([]);

  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated || authError) return;

    const fetchProfile = async () => {
      try {
        const profileResponse = await fetchWithAuth(`/api/protected/profile`, {
          method: "GET",
        });
        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          setProfile(profileData);
        } else {
          setError(profileData.message || "Failed to load profile");
        }
      } catch (err: any) {
        console.error("Profile fetch failed:", err.message);
        setError("Something went wrong. Please try again.");
      }
    };

    fetchProfile();
  }, [isAuthenticated, authError, router]);

  const handleShowFriends = async () => {
    if (profile?.profileFriendCount && profile.profileFriendCount > 0) {
      try {
        const response = await fetchWithAuth('/api/protected/friend');
        const data = await response.json();
        setFriendsList(data.users || []);
        setShowFriendsModal(true);
      } catch (error) {
        console.error("Failed to fetch friends list:", error);
      }
    }
  };

  const handleShowProfileLikes = async () => {
    if (profile?.profileLikeCount && profile.profileLikeCount > 0) {
      try {
        const response = await fetchWithAuth('/api/protected/friend/profileLikeList');
        const data = await response.json();
        setProfileLikesList(data.users || []);
        setShowProfileLikesModal(true);
      } catch (error) {
        console.error("Failed to fetch profile likes list:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{authError || error}</p>
      </div>
    );
  }

  if (!profile) {
    return null; // Redirect handled by useAuth or fetchProfile
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Full width header */}
      <div className="w-full bg-white border-b">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="max-w-7xl mx-auto px-4">
            <div className="absolute -bottom-16 left-4 sm:left-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">
                    {profile.username[0].toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="mt-24 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.fullName || "John Doe"}
              </h1>
              <p className="text-base text-gray-500">@{profile.username}</p>
              <div className="mt-2 flex items-center gap-6 text-sm ">
                <button onClick={handleShowFriends} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="font-medium">{profile.profileFriendCount || 0} Friends</span>
                </button>
                <button onClick={handleShowProfileLikes} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="font-medium">{profile.profileLikeCount || 0} Profile Likes</span>
                </button>
              </div>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Passionate about building great software and contributing to
                open source projects.
              </p>
            </div>
            <div className="flex gap-3">
              <CreatePostButton />
              <button className="flex items-center gap-2 px-6 py-2 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <UserListModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        users={friendsList}
        title="Friends"
        emptyMessage="You don't have any friends yet."
      />

      <UserListModal
        isOpen={showProfileLikesModal}
        onClose={() => setShowProfileLikesModal(false)}
        users={profileLikesList}
        title="Profile Likes"
        emptyMessage="No one has liked this profile yet."
      />
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Profile info */}
          <div className="lg:w-1/3 space-y-6">
            <section className="bg-white rounded-xl p-6 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Joined January 2024</span>
                </div>
              </div>
            </section>

            {/* Work Experience */}
            <section className="bg-white rounded-xl p-6 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">Work Experience</h2>
              <div className="space-y-4">
                {[
                  {
                    position: "Senior Software Engineer",
                    company: "Tech Corp",
                    period: "2022 - Present",
                  },
                  {
                    position: "Software Engineer",
                    company: "StartUp Inc",
                    period: "2020 - 2022",
                  },
                  {
                    position: "Junior Developer",
                    company: "Dev Agency",
                    period: "2018 - 2020",
                  },
                ].map((work, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">{work.position}</h3>
                      <p className="text-gray-600">{work.company}</p>
                      <p className="text-sm text-gray-500">{work.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="bg-white rounded-xl p-6 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {[
                  {
                    school: "University of Technology",
                    degree: "Master of Computer Science",
                    year: "2018",
                  },
                  {
                    school: "City College",
                    degree: "Bachelor of Science in Software Engineering",
                    year: "2016",
                  },
                ].map((edu, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">{edu.school}</h3>
                      <p className="text-gray-600">{edu.degree}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills & Interests */}
            <section className="bg-white rounded-xl p-6 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "JavaScript",
                      "TypeScript",
                      "React",
                      "Node.js",
                      "Python",
                      "AWS",
                      "Docker",
                      "GraphQL",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-3">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Open Source",
                      "AI/ML",
                      "Web3",
                      "UI/UX Design",
                      "Cloud Computing",
                    ].map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Links */}
            <section className="bg-white rounded-xl p-6 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">Links</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { title: "Personal Website", url: "#" },
                  { title: "GitHub", url: "#" },
                  { title: "LinkedIn", url: "#" },
                  { title: "Blog", url: "#" },
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {link.title}
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Right column - Posts */}
          <div className="lg:flex-1">
            <div className="bg-white rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Posts</h2>
              <p className="text-gray-500 text-sm">Recent activity</p>
            </div>
            <div className="space-y-4">
              <PostList isProfile={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
