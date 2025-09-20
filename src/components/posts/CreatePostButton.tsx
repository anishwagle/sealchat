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
        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Create Post
      </button>

      {snackbarMessage && <Snackbar message={snackbarMessage} onClose={closeSnackbar} />}
      {isModalOpen && (
        <CreatePostModal onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />
      )}
    </>
  );
}