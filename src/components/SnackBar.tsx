import { useEffect } from 'react';

export default function Snackbar({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-indigo-500 text-white py-2 px-4 rounded-md shadow-md z-50">
      {message}
    </div>
  );
}