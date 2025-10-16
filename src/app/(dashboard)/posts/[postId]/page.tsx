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

  useEffect(() => {
    if (post) {
      resetAndFetchComments();
    }
  }, [post]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[85vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
          {/* Main Content */}
          <div className="lg:flex-1 space-y-5">
            {loading ? (
              <div className="text-center text-gray-500 py-10">
                Loading post...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 bg-white p-10 rounded-lg">
                {error}
              </div>
            ) : !post ? (
              <div className="text-center text-gray-500 bg-white p-10 rounded-lg">
                Oops! This post isn&#39;t available right now. It might have been deleted, expired, or you don&#39;t have access to it.
              </div>
            ) : (
              <PostComponent key={post.id} {...post} mentionTextAreaRef={mentionTextareaRef} />
            )}
          </div>
          
            {post?<>
          <div
            id="commentScrollableDiv"
            ref={commentsContainerRef}
            className="flex-2 overflow-y-auto p-6"
          >
            {isLoadingComments ? (
              <Loading message="Loading comments..." fullScreen={false} />
            ) : comments.length > 0 ? (
              <InfiniteScroll
                dataLength={comments.length}
                next={fetchComments}
                hasMore={hasMoreComments}
                loader={
                  <Loading
                    message="Loading more comments..."
                    fullScreen={false}
                  />
                }
                scrollableTarget="commentScrollableDiv"
                className="space-y-4"
              >
                {comments.map((comment) => (
                  <CommentItem
                    key={`${comment.id}-${comment.replies?.length || 0}`}
                    comment={comment}
                    onDelete={handleCommentDeleted}
                    post={ post}
                    onReply={handleOnReply}
                    parentCommentIdParam={parentCommentIdParam || null}
                  />
                ))}
              </InfiniteScroll>
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
              <MentionTextarea
                ref={mentionTextareaRef}
                value={newComment}
                onValueChange={setNewComment}
                placeholder="Write a comment... (use @ to mention)"
                disabled={isCommenting}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />

              <button
                type="submit"
                disabled={isCommenting || !newComment.trim()}
                className={`flex-shrink-0 text-white px-5 py-2.5 rounded-full transition-colors font-semibold ${
                  isCommenting || !newComment.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isCommenting ? "..." : "Send"}
              </button>
            </form>
          </div>
          </>
:null}
        </div>
      </div>
    </div>
  );
}