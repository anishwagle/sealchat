"use client";
import { Post, Like } from "@/types/post";
import { getTimeSince, getTimeUntil } from "@/utils/dateConveter";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import UserListModal from "../modals/UserListModal";
import { useAuth } from "@/lib/auth/useAuth";
import RenderedContent from "../RenderedContent";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import Link from "next/link";
import CreateShareModal from "./CreateShareModal";
import CommentModal from "../modals/CommentModal";
interface PostComponentProps extends Post {
  onPostDeleted?: (postId: string) => void;
  commentId?: string;
}

export default function PostComponent({ onPostDeleted, ...post }: PostComponentProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { currentUserId } = useAuth();
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(!!post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [localLikes, setLocalLikes] = useState<Like[]>([]); // This could be fetched on modal open
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { commentId } = post;
  
  const fetchLikeList = useCallback(async () => {
    if (showLikesModal) {
      const apiUrl = `/api/protected/posts/postLikeList/${post.id}`;
      const data = await fetch(apiUrl);
      const results = await data.json();
      setLocalLikes(results.likeList || []);
    }
  }, [showLikesModal, post.id]);

  useEffect(() => {
    fetchLikeList();
  }, [showLikesModal, fetchLikeList]);

  useEffect(() => {
    if (commentId) {
      setShowCommentModal(true);
      // Optionally, you can also scroll to the comment in the modal
      // or highlight the comment.
    }
  }, [commentId]);

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
  
  

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const originallyLiked = isLikedByCurrentUser;
    setIsLikedByCurrentUser(!originallyLiked);
    setLikeCount(likeCount + (originallyLiked ? -1 : 1));

    const toggleLikeUrl = `/api/protected/posts/toggleLike/${post.id}`;
    try {
      const response = await fetchWithAuth(toggleLikeUrl, { method: 'GET' });
      if (!response.ok) {
        // Revert on error
        setIsLikedByCurrentUser(originallyLiked);
        setLikeCount(likeCount);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on error
      setIsLikedByCurrentUser(originallyLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const apiUrl = `/api/protected/posts/delete/${post.id}`;
      const response = await fetchWithAuth(apiUrl, { method: 'DELETE' });

      if (response.ok) {
        setShowDeleteConfirm(false);
        if (pathname.startsWith('/posts/')) {
          router.push('/');
        } else {
          onPostDeleted?.(post.id);
        }
      } else {
        console.error("Failed to delete post");
        // Optionally, show a snackbar or toast for the error
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };



  return (
    <>
      <div className="bg-white rounded-lg border border-gray-100 p-5 relative">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-semibold ring-1 ring-blue-100">
              {post.username[0].toUpperCase()}
            </div>
            <div>
              <Link
                href={`/profile/${post.username}`}
                className="font-medium text-gray-700"
              >
                {post.username}
              </Link>
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
                { currentUserId == post.userId?(
                  <>
                {/* <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                  Edit Post
                </button>
                <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                  Change Privacy
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div> */}
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-sm text-red-500 hover:bg-gray-50 hover:text-red-600"
                >
                  Delete Post
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div> </>):null
}
                <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <RenderedContent htmlContent={post.content} className="mt-3.5 text-gray-600 prose max-w-none prose-sm prose-p:leading-relaxed prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline" />

        {post.sharedPost && (
            <PostComponent {...post.sharedPost} onPostDeleted={onPostDeleted} />
      
        )}
        {/* Interaction Section */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          {likeCount > 0 && (
            <button
              onClick={() => setShowLikesModal(true)}
              className="text-sm text-gray-600 hover:text-gray-800 mb-3 transition-colors duration-200 group flex items-center gap-1"
            >
              <span className="flex -space-x-2 mr-1.5">
                {localLikes.slice(0, 3).map((like, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium ring-2 ring-white"
                  >
                    {like.username[0].toUpperCase()}
                  </div>
                ))}
              </span>
              <span className="group-hover:underline">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </span>
            </button>
          )}
          <div className="flex gap-6 text-sm">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                isLikedByCurrentUser
                  ? "text-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <svg
                className={`w-4 h-4 ${isLiking ? "animate-pulse" : ""}`}
                fill={isLikedByCurrentUser ? "currentColor" : "none"}
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
              <span>{likeCount} Like</span>
            </button>
            <button
              onClick={() => setShowCommentModal(true)}
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
                Comment{" "}
                {post.commentCount}
              </span>
            </button>
            {post.type === "public_opinion" && !post.sharedPost ? (
            <button
              onClick={handleShare}
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
                  d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4-4v12"
                ></path>
              </svg>
              <span>Share {post.shareCount}</span>
            </button>):null}
          </div>
        </div>
      </div>

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={post.id}
        postType={post.type}
      />
      <UserListModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        users={localLikes}
        title="Liked by"
      />
      <CreateShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post.sharedPost || post}
      />
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
