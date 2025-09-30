import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Comment } from "@/types/comment";
import { getTimeSince, formatToMySQLDate } from "@/utils/dateConveter";
import RenderedContent from "../RenderedContent";
import { useAuth } from "@/lib/auth/useAuth";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import InfiniteScroll from "react-infinite-scroll-component";

interface CommentItemProps {
  comment: Comment;
  onNavigate?: () => void;
  onDelete: (commentId: string) => void;
  postId: string;
}

const REPLY_PAGE_SIZE = 5;

export default function CommentItem({ comment, onNavigate, onDelete, postId }: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showRepliesList, setShowRepliesList] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [lastReplyCreatedAt, setLastReplyCreatedAt] = useState<string | null>(null);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUserId } = useAuth();

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

  useEffect(() => {
    if (showReplyInput) {
      const textarea = replyTextareaRef.current;
      if (textarea) {
        setTimeout(() => {
          textarea.focus();
          const end = textarea.value.length;
          textarea.setSelectionRange(end, end);
        }, 0);
      }
    }
  }, [showReplyInput]);

  useEffect(() => {
    if (showRepliesList) {
      resetAndFetchReplies();
    }
  }, [showRepliesList]);

  useEffect(() => {
    if (replies.length > 0) {
      setLastReplyCreatedAt(formatToMySQLDate(replies[replies.length - 1].createdAt));
    }
  }, [replies]);

  const resetAndFetchReplies = async () => {
    setReplies([]);
    setLastReplyCreatedAt(null);
    setHasMoreReplies(true);
    await fetchReplies();
  }

  const fetchReplies = async () => {
    if (!lastReplyCreatedAt) setIsLoadingReplies(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', String(REPLY_PAGE_SIZE));
      if (lastReplyCreatedAt) params.append('cursorCreatedAt', lastReplyCreatedAt);

      const response = await fetchWithAuth(`/api/protected/posts/comment/getReply/${comment.id}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newReplies = data.replies || [];
        setReplies(prev => [...prev, ...newReplies]);
        if (newReplies.length < REPLY_PAGE_SIZE) {
          setHasMoreReplies(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleToggleReplyInput = () => {
    const willShow = !showReplyInput;
    setShowReplyInput(willShow);
    if (willShow) {
      setReplyContent(`@${comment.username} `);
    }
  };

  const handleToggleRepliesList = () => {
    setShowRepliesList(prev => !prev);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || isReplying) return;
    setIsReplying(true);
    try {
      const response = await fetchWithAuth('/api/protected/posts/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          postId: postId,
          parentCommentId: comment.id
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setReplies(prev => [data.comment, ...prev]);
        setShowReplyInput(false);
        if (!showRepliesList) setShowRepliesList(true);
        setReplyContent("");
      }
    } finally {
      setIsReplying(false);
    }
  };

  const handleReplyDeleted = (deletedReplyId: string) => {
    setReplies(prevReplies => prevReplies.filter(reply => reply.id !== deletedReplyId));
  }

  const handleDeleteComment = async () => {
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`/api/protected/posts/comment/delete/${comment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(comment.id);
        setShowDeleteConfirm(false);
      } else {
        console.error("Failed to delete comment");
        // Optionally show a snackbar for the error
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="sbg-white rounded-lg border border-gray-100 p-3 relative">
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-semibold ring-1 ring-blue-100 text-sm">
              {comment.username[0].toUpperCase()}
            </div>
            <div>
              <Link
                href={`/profile/${comment.username}`}
                className="font-medium text-gray-700 text-sm"
              >
                {comment.username}
              </Link>
              <p className="text-xs text-gray-400 flex items-center gap-1">
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
                {/* <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                  Edit Comment
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div> */}
                {currentUserId==comment.userId?<>
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-1.5 text-sm text-red-500 hover:bg-gray-50 hover:text-red-600">
                  Delete Comment
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div>
                </>:null}
                <button className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700">
                  Report Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <RenderedContent htmlContent={comment.content} className="mt-2 text-gray-600 prose max-w-none prose-sm prose-p:leading-normal prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline" />
        <div className="flex gap-4 text-sm mt-1.5">
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
          <button
            onClick={handleToggleReplyInput}
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
            <span>Reply</span>
          </button>
          {(comment.replyCount || 0) > 0 && (
            <button
              onClick={handleToggleRepliesList}
              className="text-xs text-gray-500 hover:text-blue-500 font-medium"
            >
              {showRepliesList ? '— hide replies' : `— view ${comment.replyCount || 0} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>
        {showReplyInput && (
          <div className="mt-3 flex items-start gap-2 pl-6 border-l-2 border-gray-100 pt-3">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                ref={replyTextareaRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Replying to @${comment.username}...`}
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={2}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplying || !replyContent.trim()}
                  className={`px-4 py-1.5 text-sm font-semibold text-white rounded-full transition-colors ${
                    isReplying || !replyContent.trim()
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isReplying ? "..." : "Reply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRepliesList && (
          <div className="mt-3 pl-6 border-l-2 border-gray-100 pt-3">
            {isLoadingReplies && <p className="text-sm text-gray-500">Loading replies...</p>}
            {!isLoadingReplies && replies.length > 0 && (
              <InfiniteScroll
                dataLength={replies.length}
                next={fetchReplies}
                hasMore={hasMoreReplies}
                loader={<p className="text-sm text-gray-500 text-center py-2">Loading more replies...</p>}
                scrollableTarget="commentScrollableDiv"
                className="space-y-3"
              >
                {replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onNavigate={onNavigate}
                    onDelete={handleReplyDeleted}
                    postId={postId}
                  />
                ))}
              </InfiniteScroll>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Comment</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this comment? This action cannot be
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
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}