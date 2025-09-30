import { useState, useEffect, useRef } from "react";
import { Comment } from "@/types/comment";
import CommentItem from "./CommentItem";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
import { formatToMySQLDate } from "@/utils/dateConveter";
import { PostType } from "@/types/post";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId:string;
  postType:PostType;
}

const COMMENT_PAGE_SIZE = 10;

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  postType,
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [isCommenting,setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isMoreCommentsLoading,setIsMoreCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [lastCommentCreatedAt, setLastCommentCreatedAt] = useState<string | null>(null);
  const [comments,setComments] = useState<Comment[]>([]);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const [mentionQuery, setMentionQuery] = useState('');
  const [friends, setFriends] = useState<{ username: string }[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<{ username: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const commentInputRef = useRef<HTMLTextAreaElement>(null);


  const handleCommentSubmit = async (content: string) => {
    setIsCommenting(true);

    const response = await fetchWithAuth('/api/protected/posts/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content,postId: postId }),
        credentials: 'include' // Send cookies for auth
      });

      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);
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
      loadFriends();
    }
  }, [isOpen]);

  const resetAndFetchComments = async () => {
    setIsLoadingComments(true);
    setComments([]);
    setLastCommentCreatedAt(null);
    setHasMoreComments(true);
    await fetchComments().finally(() => setIsLoadingComments(false));
  };
  const loadFriends = async () => {
    try {
      const data = await fetchWithAuth('/api/protected/friend');
      const results = await data.json();
      setFriends(results.users);
    } catch (err) {
      console.error('Failed to load friends');
    }
  };

  const getCaretCoordinates = () => {
    const textarea = commentInputRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const { selectionStart } = textarea;
    const textBeforeCaret = textarea.value.substring(0, selectionStart);
    const lines = textBeforeCaret.split('\n');
    const currentLineNumber = lines.length;
    const currentLineText = lines[lines.length - 1];
    
    const lastAtSymbol = currentLineText.lastIndexOf('@');
    const textUpToAt = lastAtSymbol >= 0 ? currentLineText.substring(0, lastAtSymbol + 1) : currentLineText;

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight || '20');
    const paddingLeft = parseInt(computedStyle.paddingLeft || '12');
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      const textWidth = context.measureText(textUpToAt).width;

      return {
        top: (currentLineNumber - 1) * lineHeight,
        left: Math.min(textWidth + paddingLeft, textarea.offsetWidth - 200)
      };
    }

    return { top: 0, left: 0 };
  };

  const updateSuggestionPosition = () => {
    if (!showSuggestions || !commentInputRef.current) return;

    const { top, left } = getCaretCoordinates();
    const lineHeight = parseInt(window.getComputedStyle(commentInputRef.current).lineHeight || '20');
    const isMobile = window.innerWidth < 640;

    setSuggestionPosition({
      top: top + lineHeight + 8,
      left: isMobile ? 8 : left
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateSuggestionPosition);
    return () => window.removeEventListener('resize', updateSuggestionPosition);
  }, [showSuggestions]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setFilteredFriends(friends.filter(f => f.username.toLowerCase().startsWith(query.toLowerCase())));
      setShowSuggestions(true);
      updateSuggestionPosition();
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (username: string) => {
    const textarea = commentInputRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const textBefore = newComment.substring(0, startPos - mentionQuery.length - 1);
    const textAfter = newComment.substring(startPos);
    const newText = `${textBefore}@${username} ${textAfter}`;
    const newCursorPosition = `${textBefore}@${username} `.length;

    setNewComment(newText);
    setShowSuggestions(false);
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    textarea.focus();
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

        <div id="commentScrollableDiv" ref={commentsContainerRef} className="flex-1 overflow-y-auto p-6">
          {isLoadingComments ? (
            <div className="text-center py-16 text-gray-500">Loading comments...</div>
          ) : comments.length > 0 ? (
            <InfiniteScroll
              dataLength={comments.length}
              next={fetchComments}
              hasMore={hasMoreComments}
              loader={<div className="text-center py-4">Loading more comments...</div>}
              scrollableTarget="commentScrollableDiv"
              className="space-y-4"
            >
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onNavigate={onClose}
                    onDelete={handleCommentDeleted}
                    postId={postId}
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
            <div className="relative flex-1">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={handleCommentChange}
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
              {showSuggestions && filteredFriends.length > 0 && (
                <ul 
                  className="absolute bottom-full mb-2 bg-white rounded-md shadow-lg border border-gray-100 max-h-40 overflow-y-auto py-1 z-50 w-48"
                >
                  {filteredFriends.map((friend) => (
                    <li
                      key={friend.username}
                      onClick={() => insertMention(friend.username)}
                      className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                        {friend.username[0].toUpperCase()}
                      </span>
                      <span>@{friend.username}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
