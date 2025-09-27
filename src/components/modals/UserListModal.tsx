import Link from 'next/link';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: { username: string }[];
  title: string;
  emptyMessage?: string;
}

export default function UserListModal({ isOpen, onClose, users, title, emptyMessage = "No users to show." }: UserListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[70vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {users.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-medium ring-1 ring-blue-100">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {user.username}
                  </p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </Link>
              <Link
                href={`/profile/${user.username}`}
                className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full transition-colors"
              >
                Visit
              </Link>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
