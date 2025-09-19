"use client";
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';


export default function CreatePostButton({onPostCreated }: {onPostCreated: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Create Post
      </button>
      {isModalOpen && (
        <CreatePostModal onClose={() => setIsModalOpen(false)} onPostCreated={onPostCreated} />
      )}
    </>
  );
}