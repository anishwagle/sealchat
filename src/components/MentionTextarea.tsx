 "use client";
 
import { useState, useEffect, useRef, ChangeEvent, FC, forwardRef } from "react";
 import { fetchWithAuth } from "@/lib/auth/fetchWithAuth";
 
 interface MentionTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
   value: string;
   onValueChange: (value: string) => void;
 }
 
const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [mentionQuery, setMentionQuery] = useState('');
    const [friends, setFriends] = useState<{ username: string }[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<{ username: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
 
    useEffect(() => {
      const loadFriends = async () => {
        try {
          const data = await fetchWithAuth('/api/protected/friend');
          const results = await data.json();
          setFriends(results.users || []);
        } catch (err) {
          console.error('Failed to load friends for mentions');
        }
      };
      loadFriends();
    }, []);
 
    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      onValueChange(text);

      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        const query = mentionMatch[1];
        setMentionQuery(query);
        setFilteredFriends(
          friends.filter(f => f.username.toLowerCase().startsWith(query.toLowerCase()))
        );
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };

    const insertMention = (username: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const startPos = textarea.selectionStart;
      const textBefore = value.substring(0, startPos - mentionQuery.length - 1);
      const textAfter = value.substring(startPos);
      const newText = `${textBefore}@${username} ${textAfter}`;
      const newCursorPosition = `${textBefore}@${username} `.length;

      onValueChange(newText);
      setShowSuggestions(false);

      // Focus and set cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    };

    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          {...props}
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
    );
  }
);

MentionTextarea.displayName = "MentionTextarea";
 
 export default MentionTextarea;