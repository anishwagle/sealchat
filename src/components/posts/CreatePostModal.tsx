import { useAuth } from '@/lib/auth/useAuth';
import { PostType } from '@/types/post';
import { useState, useEffect, useRef } from 'react';

export default function CreatePostModal({ onClose, onPostCreated }: { onClose: () => void; onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('friend_post');
  const [durationDays, setDurationDays] = useState<number | undefined>(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [friends, setFriends] = useState<{ username: string }[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<{ username: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await fetch('/api/protected/friend');
        const results = await data.json();
        
        setFriends(results.users);
      } catch (err) {
        console.error('Failed to load friends');
      }
    };
    loadFriends();
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Detect @mention
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      debugger;
      setFilteredFriends(friends.filter(f => f.username.toLowerCase().startsWith(query.toLowerCase())));
      setShowSuggestions(true);

      // Calculate suggestion position
      const textarea = textareaRef.current;
      if (textarea) {
        const { top, left } = textarea.getBoundingClientRect();
        setSuggestionPosition({ top: top + 100, left: left }); // Adjust based on cursor
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (username: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBefore = content.substring(0, cursorPosition - mentionQuery.length - 1);
    const textAfter = content.substring(cursorPosition);
    setContent(`${textBefore}@${username} ${textAfter}`);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/protected/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, durationDays: type === 'public_opinion' ? durationDays : undefined }),
        credentials: 'include' // Send cookies for auth
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      onClose();
      onPostCreated(); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Create New Post</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                What's on your mind?
              </label>
              <textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={handleContentChange}
                className="w-full rounded-lg border-gray-200 bg-gray-50/50 p-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                rows={4}
                placeholder="Write your post... (use @username to mention friends)"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Tip: You can mention friends with @username or paste YouTube URLs
              </p>
            </div>

            {showSuggestions && filteredFriends.length > 0 && (
              <ul className="absolute bg-white rounded-lg shadow-lg border border-gray-100 max-h-40 overflow-y-auto w-64 py-1 z-50">
                {filteredFriends.map((friend) => (
                  <li
                    key={friend.username}
                    onClick={() => insertMention(friend.username)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700"
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {friend.username[0].toUpperCase()}
                    </span>
                    <span>@{friend.username}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Visibility</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="friend_post"
                    checked={type === 'friend_post'}
                    onChange={() => setType('friend_post')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-700">Friends Only</p>
                    <p className="text-xs text-gray-500">Only visible to your friends</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="public_opinion"
                    checked={type === 'public_opinion'}
                    onChange={() => setType('public_opinion')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-700">Public Opinion</p>
                    <p className="text-xs text-gray-500">Visible to everyone</p>
                  </div>
                </label>
              </div>
            </div>

            {type === 'public_opinion' && (
              <div>
                <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Post Duration
                </label>
                <select
                  id="durationDays"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="w-full rounded-lg border-gray-200 bg-gray-50/50 p-2.5 text-gray-700 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>
                      {day} {day === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Public opinions will be archived after the selected duration
                </p>
              </div>
            )}

            {error && <p className="text-red-500 text-sm px-3 py-2 bg-red-50 rounded-lg">{error}</p>}
            {success && <p className="text-green-500 text-sm px-3 py-2 bg-green-50 rounded-lg">{success}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}