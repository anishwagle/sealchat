import { useState, useEffect, useRef } from "react";
import { Comment } from "@/types/comment";
import CommentItem from "./CommentItem";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";
import { PostType } from "@/types/post";
import MentionTextarea from "../MentionTextarea";
import Loading from "../Loading";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId:string;
  postType:PostType;
  commentIdParam?:string|null;
  parentCommentIdParam?:string|null;
}

const COMMENT_PAGE_SIZE = 10;

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  postType,
  commentIdParam,
  parentCommentIdParam
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [parentCommentId, setParentCommentId] = useState("");
  const [isCommenting,setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isMoreCommentsLoading,setIsMoreCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [lastCommentCreatedAt, setLastCommentCreatedAt] = useState<string | null>(null);
  const [comments,setComments] = useState<Comment[]>([]);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const handleOnReply = (parentCommentId:string,username:string)=>{
    setNewComment(`@${username}`);
    setParentCommentId(parentCommentId);
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
      debugger;
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }
      setIsCommenting(false);
  };

  const fetchComments = async()=>{
      if (isMoreCommentsLoading && !lastCommentCreatedAt) return; // Prevent re-fetch on initial load
      
      setIsMoreCommentsLoading(true);
      try {
      let apiUrl = `/api/protected/posts/comment`;
      if(postType=='friend_post') apiUrl+=`/friendComment/${postId}`;
      else if(postType=='public_opinion') apiUrl+=`/publicComment/${postId}`;

      const params = new URLSearchParams();
      params.append('limit', String(COMMENT_PAGE_SIZE));
      if (lastCommentCreatedAt) params.append('cursorCreatedAt', lastCommentCreatedAt);
      apiUrl += `?${params.toString()}`;

      const data = await fetchWithAuth(apiUrl, {method: 'GET'});
      const results = await data.json();
      const newComments = results.comments || [];

      setComments(prevComments => [...prevComments, ...newComments]);
      if (newComments.length < COMMENT_PAGE_SIZE) {
        setHasMoreComments(false);
      }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }

      setIsMoreCommentsLoading(false);
    }

    useEffect(() => {
      if (comments.length > 0) {
        // Assuming 'createdAt' is a string in ISO format
        setLastCommentCreatedAt(formatToMySQLDate(comments[comments.length - 1].createdAt));
      }
    }, [comments]);
  // Effect to handle clicks outside of the active menu to close it
  useEffect(() => {
    if (isOpen) {      
      resetAndFetchComments();
    }
  }, [isOpen]);

  const resetAndFetchComments = async () => {
    setIsLoadingComments(true);
    setComments([]);
    setLastCommentCreatedAt(null);
    setParentCommentId("");
    setHasMoreComments(true);
    await fetchComments().finally(() => setIsLoadingComments(false));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      handleCommentSubmit(newComment);
      setNewComment("");
      if (commentsContainerRef.current) {
        // Scroll to the top after submitting a new comment
        commentsContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth' // Optional: Add smooth scrolling
        });
      }
    }
  };

  const handleCommentDeleted = (deletedCommentId: string) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== deletedCommentId));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Comments</h2>
          <button
            onClick={()=>{
              resetAndFetchComments();
              onClose();
            }}
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

        <div id="commentScrollableDiv" ref={commentsContainerRef} className="flex-1 overflow-y-auto p-6">
          {isLoadingComments ? (
            <Loading message="Loading comments..." fullScreen={false}/>
          ) : comments.length > 0 ? (
            <InfiniteScroll
              dataLength={comments.length}
              next={fetchComments}
              hasMore={hasMoreComments}
              loader={<Loading message="Loading more comments..." fullScreen={false}/>}
              scrollableTarget="commentScrollableDiv"
              className="space-y-4"
            >
                {comments.map((comment) => (
                  <CommentItem
                    key={`${comment.id}-${comment.replies?.length || 0}`}
                    comment={comment}
                    onNavigate={onClose}
                    onDelete={handleCommentDeleted}
                    postId={postId}
                    onReply={handleOnReply}
                    parentCommentIdParam={parentCommentIdParam||null}
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
                value={newComment}
                onValueChange={setNewComment}
                placeholder="Write a comment... (use @ to mention)"
                disabled={isCommenting}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
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
      </div>
    </div>
  );
}
