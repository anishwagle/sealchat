"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Post } from "@/types/post";
import PostComponent from "@/components/posts/Post";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import Loading from "@/components/Loading";
import InfiniteScroll from "react-infinite-scroll-component";
import CommentItem from "@/components/modals/CommentItem";
import { Comment } from "@/types/comment";
import MentionTextarea from "@/components/MentionTextarea";
const COMMENT_PAGE_SIZE = 10;
export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const commentIdParam = searchParams.get('commentId');
  const parentCommentIdParam = searchParams.get('parentCommentId');
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isMoreCommentsLoading, setIsMoreCommentsLoading] = useState(false);
  const [lastCommentCreatedAt, setLastCommentCreatedAt] = useState<
    string | null
  >(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [parentCommentId, setParentCommentId] = useState("");
  const mentionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isCommenting,setIsCommenting] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!postId) return; // Don't fetch if postId is not available yet
    setLoading(true);
    try {
      const apiUrl = `/api/protected/posts/${postId}`;

      const data = await fetchWithAuth(apiUrl);
      const results = await data.json();
      setPost(results.post);
      setError(null);
    } catch (err: any) {
      setError("Failed to load post: " + err.message);
    } finally {
      await resetAndFetchComments();
      setLoading(false);
    }
  }, [postId]);

  const fetchComments = async () => {
    if (isMoreCommentsLoading && !lastCommentCreatedAt) return; // Prevent re-fetch on initial load

    setIsMoreCommentsLoading(true);
    try {
      let apiUrl = `/api/protected/posts/comment/get/${postId}`;

      const params = new URLSearchParams();
      params.append("limit", String(COMMENT_PAGE_SIZE));
      if (lastCommentCreatedAt)
        params.append("cursorCreatedAt", lastCommentCreatedAt);
      apiUrl += `?${params.toString()}`;

      const data = await fetchWithAuth(apiUrl, { method: "GET" });
      const results = await data.json();
      const newComments = results.comments || [];

      setComments((prevComments) => [...prevComments, ...newComments]);
      if (newComments.length > 0) {
        setLastCommentCreatedAt(newComments[newComments.length - 1].createdAt);
      }
      if (newComments.length < COMMENT_PAGE_SIZE) {
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }

    setIsMoreCommentsLoading(false);
  };
  const handleCommentDeleted = (deletedCommentId: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== deletedCommentId)
    );
  };
  const handleOnReply = (parentCommentId: string, username: string) => {
    setNewComment(`@${username} `);
    setParentCommentId(parentCommentId);
    setTimeout(() => {
      if (mentionTextareaRef.current) {
        mentionTextareaRef.current.focus();
        const val = mentionTextareaRef.current.value;
        mentionTextareaRef.current.setSelectionRange(val.length, val.length);
      }
    }, 0);
  }
  const handleCommentSubmit = async (content: string) => {
    setIsCommenting(true);

    const response = await fetchWithAuth('/api/protected/posts/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content,postId: postId,parentCommentId }),
        credentials: 'include' // Send cookies for auth
      });

      const data = await response.json();
      if(!!!parentCommentId) {setComments(prev => [data.comment, ...prev])}
      else {
        // Find the parent comment and add the reply to its replies array
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.id === parentCommentId) {
              // Ensure comment.replies is initialized as an array
              const updatedComment = {
                ...comment,
                replyCount:comment.replyCount||0+1,
                replies: [...(comment.replies || []), data.comment],
              };
              return updatedComment;
            }
            return comment;
          });
        });
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }
      setNewComment("");
      setParentCommentId("");
      setIsCommenting(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      handleCommentSubmit(newComment);
    }
  };
  const resetAndFetchComments = async () => {
    setIsLoadingComments(true);
    setComments([]);
    setLastCommentCreatedAt(null);
    setParentCommentId("");
    setHasMoreComments(true);
    await fetchComments().finally(() => setIsLoadingComments(false));
  };
  useEffect( () => {
    if (postId) {
      fetchPosts();
    }
  }, [postId, fetchPosts]);

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[85vh]">
          {/* Post Content Section */}
          <div className="flex-none">
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <Loading message="Loading post..." />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : !post ? (
              <div className="p-8 text-center">
                <div className="bg-gray-50 rounded-lg p-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Post Not Available</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    This post isn&apos;t available right now. It might have been deleted, expired, or you don&apos;t have access to it.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-b border-gray-100">
                <PostComponent key={post.id} {...post} mentionTextAreaRef={mentionTextareaRef} />
              </div>
            )}
          </div>

          {/* Comments Section */}
          {post && (
            <>
              <div
                id="commentScrollableDiv"
                ref={commentsContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-6"
              >
                {isLoadingComments ? (
                  <div className="py-8 flex justify-center">
                    <Loading message="Loading comments..." fullScreen={false} />
                  </div>
                ) : comments.length > 0 ? (
                  <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchComments}
                    hasMore={hasMoreComments}
                    loader={
                      <div className="py-4 flex justify-center">
                        <Loading message="Loading more comments..." fullScreen={false} />
                      </div>
                    }
                    scrollableTarget="commentScrollableDiv"
                    className="space-y-4 py-4"
                  >
                    {comments.map((comment) => (
                      <div
                        id={`comment-${comment.id}`}
                        key={`${comment.id}-${comment.replies?.length || 0}`}
                        className="transition-all duration-200 hover:bg-gray-50 rounded-lg"
                      >
                        <CommentItem
                          comment={comment}
                          onDelete={handleCommentDeleted}
                          post={post}
                          onReply={handleOnReply}
                          parentCommentIdParam={
                            parentCommentIdParam == comment.id
                              ? parentCommentIdParam
                              : null
                          }
                        />
                      </div>
                    ))}
                  </InfiniteScroll>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No comments yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Comment Input Section */}
              <div className="flex-none border-t border-gray-100 bg-white p-4">
                <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-3xl mx-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex-shrink-0" />
                  <div className="flex-1">
                    <MentionTextarea
                      ref={mentionTextareaRef}
                      value={newComment}
                      onValueChange={setNewComment}
                      placeholder="Write a comment... (use @ to mention)"
                      disabled={isCommenting}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCommenting || !newComment.trim()}
                    className={`flex-none inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isCommenting || !newComment.trim()
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {isCommenting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending
                      </span>
                    ) : (
                      "Send"
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}