import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Comment } from "@/types/post";
import { getTimeSince } from "@/utils/dateConveter";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onSubmit: (comment: string) => void;
  isSubmitting?: boolean;
}

export default function CommentModal({
  isOpen,
  onClose,
  comments,
  onSubmit,
  isSubmitting,
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside of the active menu to close it
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmit(newComment);
      setNewComment("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {comments.length > 0 ? (
            <div className="sbg-white rounded-lg border border-gray-100 p-5 relative">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
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
                            <span>
                              {getTimeSince(new Date(comment.createdAt))}
                            </span>
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
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                    <div className="flex gap-6 text-sm">
                      <button
                        disabled={isLiking}
                        className={`flex items-center gap-1.5 transition-colors duration-200 ${
                          true
                            ? "text-blue-500"
                            : "text-gray-500 hover:text-blue-500"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${
                            isLiking ? "animate-pulse" : ""
                          }`}
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
                      <button
                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors duration-200"
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
                            strokeWidth="1.5"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>
                          Reply
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">🤔</p>
              <h3 className="font-semibold text-gray-800">No comments yet</h3>
              <p className="text-sm text-gray-500">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0"></div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={isSubmitting}
              className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className={`flex-shrink-0 text-white px-5 py-2.5 rounded-full transition-colors font-semibold ${
                isSubmitting || !newComment.trim()
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
