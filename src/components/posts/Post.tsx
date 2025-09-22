"use client";
import { Post } from "@/types/post";
import { getTimeSince, getTimeUntil } from "@/utils/dateConveter";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function PostComponent(post: Post) {
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5 relative">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-semibold ring-1 ring-blue-100">
            {post.username[0].toUpperCase()}
          </div>
          <div>
            <Link href={`/profile/${post.username}`} className="font-medium text-gray-700">{post.username}</Link>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span
                className={`${
                  post.type === "friend_post"
                    ? "text-emerald-500"
                    : "text-blue-500"
                }`}
              >
                {post.type === "friend_post"
                  ? "Friends Only"
                  : "Public Opinion"}
              </span>
              <span className="text-gray-300">•</span>
              <span>{getTimeSince(new Date(post.createdAt))}</span>
              {post.expiresAt && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-amber-500">
                    {getTimeUntil(new Date(post.expiresAt))}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Options Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-[0_3px_10px_-3px_rgba(0,0,0,0.1)] py-1 z-10 ring-1 ring-gray-100">
              <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                Edit Post
              </button>
              <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                Change Privacy
              </button>
              <div className="h-[1px] bg-gray-100 my-1"></div>
              <button className="w-full text-left px-4 py-1.5 text-sm text-red-500 hover:bg-gray-50 hover:text-red-600">
                Delete Post
              </button>
              <div className="h-[1px] bg-gray-100 my-1"></div>
              <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div
        className="mt-3.5 text-gray-600 prose max-w-none prose-sm prose-p:leading-relaxed prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Interaction Section */}
      <div className="mt-4 flex gap-6 text-sm pt-4 border-t border-gray-50">
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors duration-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>0 likes</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors duration-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>0 comments</span>
        </button>
      </div>
    </div>
  );
}
