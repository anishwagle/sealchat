"use client";
import { useEffect, useState } from "react";
import CreatePostButton from "@/components/posts/CreatePostButton";
import PostList from "@/components/posts/PostList";
import { useAuth } from "@/lib/auth/useAuth";
import { HiOutlineUsers, HiOutlineGlobeAlt } from "react-icons/hi2";

export default function Dashboard() {
  const [isPublic, setIsPublic] = useState(false);
  const { isAuthenticated, isLoading, error: authError } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated || authError) return;
  }, [isAuthenticated, isLoading]);

  return (
    <>
      {/* Create Post Section */}
      <div className="space-y-6">
        <CreatePostButton />

        {/* Feed Mode Toggle & Content */}
        <div className="space-y-6">
          {/* Elegant Tab-Style Toggle */}
          <div className="flex items-center gap-1 border-b border-border pb-4">
            <button
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 -mb-4 ${
                !isPublic
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <HiOutlineUsers className="w-5 h-5" />
              <span>Friends</span>
            </button>
            <button
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 -mb-4 ${
                isPublic
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <HiOutlineGlobeAlt className="w-5 h-5" />
              <span>Public</span>
            </button>
          </div>

          {/* Feed Description */}
          <div className="text-sm text-muted-foreground">
            {isPublic
              ? "Showing posts from everyone"
              : "Showing posts from your friends only"}
          </div>

          {/* Post List */}
          <PostList isProfile={false} isPublic={isPublic} />
        </div>
      </div>
    </>
  );
}