'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import Navbar from '@/components/Navbar';
import { Profile } from '@/types/profile';
import Link from 'next/link';
import ProfileLikeButton from '@/components/profile/ProfileLikeButton';

export default function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [loadingActionType, setLoadingActionType] = useState<null | "accept" | "decline" | "send" | "cancel" | "unfriend">(null);
  const { isAuthenticated, userId, isLoading, error: authError } = useAuth();
  const router = useRouter();
  const { username } = useParams();

  // fetchProfile now defined outside useEffect for reuse
  const fetchProfile = async () => {
    try {
      const profileResponse = await fetch(`/api/protected/profile/${username}`, {
        method: 'GET',
      });
      const profileData = await profileResponse.json();
      if (profileResponse.ok) {
        setProfile(profileData);
      } else {
        setError(profileData.message || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Profile fetch failed:', err.message);
      setError('Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authError) return;
    fetchProfile();
  }, [isAuthenticated, authError, userId, username, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
      <Navbar />
      
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
              <h1 className="text-3xl font-bold text-gray-900">{profile.fullName || 'John Doe'}</h1>
              <p className="text-base text-gray-500">@{profile.username}</p>
             
              <p className="mt-3 text-gray-600 max-w-2xl">
                {profile.bio || 'Passionate about building great software and contributing to open source projects.'}
              </p>
            </div>
            {profile.userId !== userId ? (
              <div className="flex gap-3">
                {profile.friendshipStatus === "none" ? (
                  <button
                    className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={async () => {
                      setLoadingActionType("send");
                      try {
                        await fetch("/api/protected/friend/sendRequest", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId2: profile.userId }),
                        });
                        await fetchProfile();
                      } finally {
                        setLoadingActionType(null);
                      }
                    }}
                    disabled={loadingActionType !== null}
                  >
                    {loadingActionType === "send" ? "Loading..." : "Add Friend"}
                  </button>
                ) : null}
                {profile.friendshipStatus === "sent" ? (
                  <button
                    className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={async () => {
                      setLoadingActionType("cancel");
                      try {
                        await fetch("/api/protected/friend/cancelRequest", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId2: profile.userId }),
                        });
                        await fetchProfile();
                      } finally {
                        setLoadingActionType(null);
                      }
                    }}
                    disabled={loadingActionType !== null}
                  >
                    {loadingActionType === "cancel" ? "Loading..." : "Cancel Request"}
                  </button>
                ) : null}
                {profile.friendshipStatus === "received" ? (
                  <>
                    <button
                      className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={async () => {
                        setLoadingActionType("accept");
                        try {
                          await fetch("/api/protected/friend/acceptRequest", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId2: profile.userId }),
                          });
                          await fetchProfile();
                        } finally {
                          setLoadingActionType(null);
                        }
                      }}
                      disabled={loadingActionType === "decline" || loadingActionType === "accept"}
                    >
                      {loadingActionType === "accept" ? "Loading..." : "Accept Friend"}
                    </button>
                    <button
                      className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={async () => {
                        setLoadingActionType("decline");
                        try {
                          await fetch("/api/protected/friend/cancelRequest", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId2: profile.userId }),
                          });
                          await fetchProfile();
                        } finally {
                          setLoadingActionType(null);
                        }
                      }}
                      disabled={loadingActionType === "accept" || loadingActionType === "decline"}
                    >
                      {loadingActionType === "decline" ? "Loading..." : "Decline Request"}
                    </button>
                  </>
                ) : null}
                {profile.friendshipStatus === "accepted" ? (
                  <button
                    className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                    onClick={async () => {
                      setLoadingActionType("unfriend");
                      try {
                        await fetch("/api/protected/friend/unfriend", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId2: profile.userId }),
                        });
                        await fetchProfile();
                      } finally {
                        setLoadingActionType(null);
                      }
                    }}
                    disabled={loadingActionType !== null}
                  >
                    {loadingActionType === "unfriend" ? "Loading..." : "Unfriend"}
                  </button>
                ) : null}
                {/* Message button: only for accepted friends */}
                {profile.friendshipStatus === "accepted" && (
                  <button className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    Message
                  </button>
                )}
                {/* Profile Like button */}
                <ProfileLikeButton
                  profile={profile}
                  fetchProfile={fetchProfile}
                />
              </div>
            ) : (
              <Link href="/profile" className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Profile info */}
          <div className="lg:w-1/3 space-y-6">
            <section className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>Joined January 2024</span>
                </div>
              </div>
            </section>

            {/* Work Experience */}
            <section className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Work Experience</h2>
              <div className="space-y-4">
                {[
                  { position: 'Senior Software Engineer', company: 'Tech Corp', period: '2022 - Present' },
                  { position: 'Software Engineer', company: 'StartUp Inc', period: '2020 - 2022' },
                  { position: 'Junior Developer', company: 'Dev Agency', period: '2018 - 2020' }
                ].map((work, index) => (
                  <div key={index} className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
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
            <section className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {[
                  { school: 'University of Technology', degree: 'Master of Computer Science', year: '2018' },
                  { school: 'City College', degree: 'Bachelor of Science in Software Engineering', year: '2016' }
                ].map((edu, index) => (
                  <div key={index} className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
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
            <section className="bg-white rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-3">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {['Open Source', 'AI/ML', 'Web3', 'UI/UX Design', 'Cloud Computing'].map((interest) => (
                      <span key={interest} className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Links */}
            <section className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Links</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { title: 'Personal Website', url: '#' },
                  { title: 'GitHub', url: '#' },
                  { title: 'LinkedIn', url: '#' },
                  { title: 'Blog', url: '#' }
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
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
              {[1, 2, 3].map((post) => (
                <div key={post} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                      {profile.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{profile.username}</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">
                    This is a placeholder post. The actual content will be displayed here once the posts feature is implemented.
                  </p>
                  <div className="mt-4 flex gap-6 text-sm text-gray-500">
                    <button className="flex items-center gap-2 hover:text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      <span>0 likes</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      <span>0 comments</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
