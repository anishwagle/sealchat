 "use client";
 
 import { useState, useEffect } from "react";
 import { Post } from "@/types/post";
 import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
 import PostComponent from "../posts/Post";
import MentionTextarea from "../MentionTextarea";
 
 interface CreateShareModalProps {
   isOpen: boolean;
   onClose: () => void;
   post: Post;
 }
 
 export default function CreateShareModal({
   isOpen,
   onClose,
   post,
 }: CreateShareModalProps) {
   const [content, setContent] = useState("");
   const [isSharing, setIsSharing] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   const handleShare = async () => {
     setIsSharing(true);
     setError(null);
 
     try {
        debugger;
       const response = await fetchWithAuth("/api/protected/posts/create", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           content,
           type: post.type,
           durationDays: post.durationDays, // Assuming durationDays is on the post object
           sharedPostId: post.id,
         }),
       });
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || "Failed to share post.");
       }
 
       // Successfully shared
       onClose();
       setContent(""); // Reset content for next time
       // Optionally, you could trigger a feed refresh here
     } catch (err: any) {
       setError(err.message);
       console.error("Error sharing post:", err);
     } finally {
       setIsSharing(false);
     }
   };
 
   // Reset content when modal is closed
   useEffect(() => {
    if (!isOpen) {
      setContent("");
    }
   }, [isOpen]);
 
   if (!isOpen) return null;
 
   return (
     <div
       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
       onClick={onClose}
     >
       <div
         className="bg-white rounded-lg p-6 max-w-2xl w-full"
         onClick={(e) => e.stopPropagation()}
       >
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-semibold">Share Post</h3>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
             <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         </div>
         
         <MentionTextarea
           value={content}
           onValueChange={setContent}
           placeholder="Add your thoughts... (mentions with @ are supported)"
           className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
           disabled={isSharing}
         />
 
         <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50/50 pointer-events-none">
            <p className="text-xs text-gray-400 mb-2 font-medium">Post Preview:</p>
            {/* We render a simplified, non-interactive version of the post */}
            <div className="opacity-80 scale-95 transform-origin-top-left">
                <PostComponent {...post} onPostDeleted={() => {}} />
            </div>
         </div>
 
         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
 
         <div className="flex justify-end gap-3 mt-6">
           <button
             onClick={onClose}
             disabled={isSharing}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50"
           >
             Cancel
           </button>
           <button
             onClick={handleShare}
             disabled={isSharing || !content.trim()}
             className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
           >
             {isSharing ? "Sharing..." : "Share"}
           </button>
         </div>
       </div>
     </div>
   );
 }