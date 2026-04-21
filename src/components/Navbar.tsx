"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import NotificationComponent from "./Notification";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types/user";
import { HiOutlineUser, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
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

      try {
        const users = await fetchWithAuth(`/api/protected/friend/findFriend/${value}`, {
          method: "GET",
        });
        const results = await users.json();
        setSearchResults(results.users.map((x: User) => x));
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
    <nav className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/feed" className="text-lg font-semibold text-foreground font-mono shrink-0">
              SealChat
            </Link>

            {/* Search Bar - Desktop only */}
            <div className="hidden sm:flex flex-1 max-w-xs" ref={searchRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-muted rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 border border-border transition-colors"
                  placeholder="Search..."
                />
                <div className="absolute left-3 top-2.5">
                  <svg
                    className="h-4 w-4 text-muted-foreground"
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

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full bg-background rounded-lg shadow-lg border border-border z-50">
                    <ul className="max-h-80 overflow-auto py-2 divide-y divide-border">
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          onClick={() => {
                            router.push(`/profile/${result.username}`);
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
                          className="px-4 py-2.5 hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-medium ring-1 ring-border shrink-0">
                              {result.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {result.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                @{result.username}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="p-2.5 border-t border-border">
                      <button
                        onClick={() => router.push("/find-friends")}
                        className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1"
                      >
                        View all results
                      </button>
                    </div>
                  </div>
                )}

                {/* Searching State */}
                {isSearching && (
                  <div className="absolute mt-2 w-full bg-background rounded-lg shadow-lg border border-border p-3 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Notifications & Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notifications */}
              <NotificationComponent />

              {/* Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-semibold ring-1 ring-border">
                    U
                  </div>
                </button>

                {/* Profile Menu Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-44 bg-background rounded-lg shadow-lg border border-border transition-all duration-150 ${
                    isProfileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                >
                  <ul className="py-1">
                    <li>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <HiOutlineUser className="w-4 h-4" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <HiOutlineCog6Tooth className="w-4 h-4" />
                        Settings
                      </Link>
                    </li>
                    <li className="border-t border-border">
                      <button
                        onClick={async () => {
                          try {
                            await supabase.auth.signOut();
                            await fetch("/api/auth/logout", { method: "POST" });
                            router.push("/");
                          } catch (error: any) {
                            console.error("Logout failed:", error.message);
                            router.push("/");
                          }
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
