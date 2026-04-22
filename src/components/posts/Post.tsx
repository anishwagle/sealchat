"use client";
import { Post, Like } from "@/types/post";
import { getTimeSince, getTimeUntil } from "@/utils/dateConveter";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import UserListModal from "../modals/UserListModal";
import { useAuth } from "@/lib/auth/useAuth";
import RenderedContent from "../RenderedContent";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import Link from "next/link";
import CreateShareModal from "./CreateShareModal";
import CommentModal from "../modals/CommentModal";
import { 
  HiOutlineEllipsisHorizontal, 
  HiOutlineHeart, 
  HiOutlineChatBubbleLeft, 
  HiOutlineArrowUpTray,
  HiOutlineTrash
} from "react-icons/hi2";
import { LiaHeartSolid } from "react-icons/lia";
interface PostComponentProps extends Post {
  onPostDeleted?: (postId: string) => void;
  mentionTextAreaRef?: React.RefObject<HTMLTextAreaElement|null>;
}

export default function PostComponent({ onPostDeleted, mentionTextAreaRef, ...post }: PostComponentProps) {
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

  const handleCommentClick = () => {
    if (mentionTextAreaRef?.current) {
      mentionTextAreaRef.current.focus();
    } else {
      setShowCommentModal(true);
    }
  };



  return (
    <>
      <div className="bg-background rounded-lg border border-border p-6 relative hover:shadow-md transition-shadow duration-200">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold ring-1 ring-border shrink-0">
              {post.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${post.username}`}
                className="font-medium text-foreground hover:underline block"
              >
                {post.fullName}
              </Link>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="text-sm">@{post.username}</span>
                <span>•</span>
                <span
                  className={`font-medium ${
                    post.type === "friend_post"
                      ? "text-emerald-600"
                      : "text-blue-600"
                  }`}
                >
                  {post.type === "friend_post"
                    ? "Friends"
                    : "Public"}
                </span>
                <span>•</span>
                <span>{getTimeSince(new Date(post.createdAt))}</span>
                {post.expiresAt && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">
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
              className="p-2 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground"
            >
              <HiOutlineEllipsisHorizontal className="w-5 h-5" />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border py-2 z-10">
                {currentUserId == post.userId && (
                  <>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      Delete Post
                    </button>
                    <div className="h-px bg-border my-1"></div>
                  </>
                )}
                <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors duration-200">
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <RenderedContent htmlContent={post.content} className="mt-4 text-foreground prose max-w-none prose-sm prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline" />

        {post.sharedPost && (
          <div className="mt-4">
            <PostComponent {...post.sharedPost} onPostDeleted={onPostDeleted} />
          </div>
        )}

        {/* Interaction Section */}
        <div className="mt-5 pt-4 border-t border-border">
          {likeCount > 0 && (
            <button
              onClick={() => setShowLikesModal(true)}
              className="text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors duration-200 group flex items-center gap-2"
            >
              <span className="flex -space-x-1">
                {localLikes.slice(0, 3).map((like, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-medium ring-2 ring-background"
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
          
          <div className="flex gap-4 text-sm">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 font-medium transition-colors duration-200 ${
                isLikedByCurrentUser
                  ? "text-red-600"
                  : "text-muted-foreground hover:text-red-600"
              } disabled:opacity-50`}
            >
              {isLikedByCurrentUser ? (
                <LiaHeartSolid className={`w-5 h-5 ${isLiking ? "animate-pulse" : ""}`} />
              ) : (
                <HiOutlineHeart className={`w-5 h-5 ${isLiking ? "animate-pulse" : ""}`} />
              )}
              <span>{likeCount}</span>
            </button>

            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-blue-600 transition-colors duration-200"
            >
              <HiOutlineChatBubbleLeft className="w-5 h-5" />
              <span>{post.commentCount}</span>
            </button>

            {post.type === "public_opinion" && !post.sharedPost && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-green-600 transition-colors duration-200"
              >
                <HiOutlineArrowUpTray className="w-5 h-5" />
                <span>{post.shareCount}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        post={post}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border border-border p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-3">Delete Post</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-red-400 disabled:cursor-not-allowed"
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