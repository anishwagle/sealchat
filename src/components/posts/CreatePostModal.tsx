import { useAuth } from '@/lib/auth/useAuth';
import { PostType } from '@/types/post';
import { useState, useEffect, useRef } from 'react';

export default function CreatePostModal({ onClose , onPostCreated}: { onClose: () => void; onPostCreated:()=>void }) {
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
    <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Post Content
            </label>
            <textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={handleContentChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Write your post... (e.g., @friend or YouTube URL)"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Mention friends with @username or embed videos. Embeds may share data with third parties.
            </p>
          </div>

          {showSuggestions && filteredFriends.length > 0 && (
            <ul className="absolute bg-white border rounded-md shadow-md max-h-40 overflow-y-auto" style={{ top: suggestionPosition.top, left: suggestionPosition.left }}>
              {filteredFriends.map((friend) => (
                <li
                  key={friend.username}
                  onClick={() => insertMention(friend.username)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  @{friend.username}
                </li>
              ))}
            </ul>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Post Type</label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="friend_post"
                  checked={type === 'friend_post'}
                  onChange={() => setType('friend_post')}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Friends Only</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="public_opinion"
                  checked={type === 'public_opinion'}
                  onChange={() => setType('public_opinion')}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Public Opinion</span>
              </label>
            </div>
          </div>

          {type === 'public_opinion' && (
            <div className="mb-4">
              <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
                Duration (days)
              </label>
              <select
                id="durationDays"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={day}>
                    {day} {day === 1 ? 'day' : 'days'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Public opinions expire after the selected duration and are archived.
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}