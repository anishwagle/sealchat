import { useState, useEffect, useRef } from "react";
import { Comment, PostType } from "@/types/post";
import CommentItem from "./CommentItem";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId:string;
  postType:PostType;
}

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  postType,
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [isCommenting,setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const [comments,setComments] = useState<Comment[]>([]);
  const commentsContainerRef = useRef<HTMLDivElement>(null);


  const handleCommentSubmit = async (content: string) => {
    setIsCommenting(true);

    const response = await fetch('/api/protected/posts/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content,postId: postId }),
        credentials: 'include' // Send cookies for auth
      });

      const data = await response.json();
      setComments([...comments, data.comment]);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }
     
      setIsCommenting(false);
  };
  const fetchComments = async()=>{
      setIsLoadingComments(true);
      try {
      let apiUrl = `/api/protected/posts/comment`;
      if(postType=='friend_post') apiUrl+=`/friendComment/${postId}`;
      else if(postType=='public_opinion') apiUrl+=`/publicComment/${postId}`;

      const data = await fetch(apiUrl);
      const results = await data.json();
      setComments(results.comments.map((x: Comment) => x));
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    }
  // Effect to handle clicks outside of the active menu to close it
  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen]);

  useEffect(() => {
    // Scroll to the bottom when comments change
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      handleCommentSubmit(newComment);
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

        <div ref={commentsContainerRef} className="flex-1 overflow-y-auto p-6">
          {isLoadingComments ? (
            <div className="text-center py-16 text-gray-500">Loading comments...</div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
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
              disabled={isCommenting}
              className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
