"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, SetStateAction } from "react";
import NotificationComponent from "./Notification";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: number; username: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setIsSearching(true);

      // TODO: Replace with actual API call
      try {
        const users = await fetch(`/api/protected/friend/findFriend/${value}`, {
          method: "GET",
        });
        const results = await users.json();
        setSearchResults(
          results.users.map((x: { id: any; username: any }) => ({
            id: x.id,
            username: x.username,
          }))
        );
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-semibold text-blue-600">
              SealChat
            </Link>

            {/* Search Bar */}
            <div className="hidden sm:block w-96 lg:w-[480px]" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-gray-50/50 rounded-full px-5 py-2.5 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 border border-gray-100 focus:border-blue-200"
                  placeholder="Search users..."
                />
                <div className="absolute left-4 top-3">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white rounded-lg shadow-sm border border-gray-100">
                    <ul className="max-h-[320px] overflow-auto py-2 divide-y divide-gray-50">
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          onClick={() => {
                            router.push(`/profile/${result.username}`);
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-medium ring-1 ring-blue-100">
                              {result.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                John Doe
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{result.username}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={() => router.push("/find-friends")}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        Show all results
                      </button>
                    </div>
                  </div>
                )}
                {isSearching && (
                  <div className="absolute mt-1 w-full bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Icons - increase size slightly */}
          <div className="flex items-center gap-2">
            {/* Messages */}
            <button className="p-2.5 hover:bg-gray-50 rounded-full relative">
              <svg
                className="h-[22px] w-[22px] text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"
                />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            {/* Notifications */}

            <NotificationComponent />
            

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="p-1.5 hover:bg-gray-50 rounded-full">
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">U</span>
                </div>
              </button>

              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-sm border border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                <ul className="py-1">
                  <li>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Settings
                      </div>
                    </Link>
                  </li>

                  <li
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 cursor-pointer"
                    onClick={async () => {
                      try {
                        await fetch("/api/auth/logout", { method: "POST" });
                        router.push("/login");
                      } catch (error: any) {
                        console.error("Logout failed:", error.message);
                        router.push("/login");
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
