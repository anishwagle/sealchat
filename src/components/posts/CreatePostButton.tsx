"use client";
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import Snackbar from '../SnackBar';
import { HiOutlinePencilSquare } from 'react-icons/hi2';

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
        className="w-full group flex items-center justify-center gap-2 bg-foreground text-background py-3 px-6 rounded-lg font-medium text-sm
        shadow-md hover:shadow-lg 
        transition-all duration-200 ease-in-out 
        hover:bg-foreground/90
        focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
      >
        <HiOutlinePencilSquare className="w-5 h-5" />
        <span>Create Post</span>
      </button>

      {snackbarMessage && <Snackbar message={snackbarMessage} onClose={closeSnackbar} />}
      {isModalOpen && (
        <CreatePostModal onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />
      )}
    </>
  );
}