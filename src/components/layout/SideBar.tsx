"use client";

import Link from "next/link";
import SuggestedFriends from "./SuggestedFriends";
import SuggestedProfiles from "./SuggestedProfiles";

export default function SideBar() {
  return (
    <aside className="lg:w-80 shrink-0">
      <div className="space-y-5">
        {/* Profile Quick View */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-blue-600 font-medium">U</span>
            </div>
            <div>
              <h3 className="font-medium">Username</h3>
              <p className="text-sm text-gray-500">@username</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white rounded-lg p-2">
          <Link href="/" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Link href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Friends
          </Link>
          <Link href="#" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
          </Link>
        </nav>

        {/* Friend Suggestions */}
        <SuggestedFriends/>

        {/* Profile Suggestions */}
        <SuggestedProfiles />
      </div>
    </aside>
  );
}