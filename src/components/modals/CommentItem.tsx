import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Comment } from "@/types/post";
import { getTimeSince } from "@/utils/dateConveter";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
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
    <div className="sbg-white rounded-lg border border-gray-100 p-5 relative">
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-semibold ring-1 ring-blue-100">
              {comment.username[0].toUpperCase()}
            </div>
            <div>
              <Link
                href={`/profile/${comment.username}`}
                className="font-medium text-gray-700"
              >
                {comment.username}
              </Link>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="text-gray-300">•</span>
                <span>{getTimeSince(new Date(comment.createdAt))}</span>
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
                  Edit Comment
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-1.5 text-sm text-red-500 hover:bg-gray-50 hover:text-red-600">
                  Delete Comment
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                  Report Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div
          className="mt-3.5 text-gray-600 prose max-w-none prose-sm prose-p:leading-relaxed prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />
        <div className="flex gap-6 text-sm mt-2">
          <button
            disabled={isLiking}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              true ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <svg
              className={`w-4 h-4 ${isLiking ? "animate-pulse" : ""}`}
              fill={true ? "currentColor" : "none"}
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
            <span>Like</span>
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
            <span>Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
}