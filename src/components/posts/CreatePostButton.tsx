"use client";
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import Snackbar from '../SnackBar';


export default function CreatePostButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
const handlePostCreated = () => {
    setSnackbarMessage("Posted successfully!");
  };
   const closeSnackbar = () => {
    setSnackbarMessage(null);
  };
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-5 rounded-lg 
        shadow-[0_3px_10px_-3px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_-3px_rgba(59,130,246,0.4)] 
        transition-all duration-200 ease-in-out hover:from-blue-600 hover:to-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg 
          className="w-4 h-4 text-white/90" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span className="font-medium tracking-wide">Create Post</span>
      </button>

      {snackbarMessage && <Snackbar message={snackbarMessage} onClose={closeSnackbar} />}
      {isModalOpen && (
        <CreatePostModal onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />
      )}
    </>
  );
}