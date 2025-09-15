"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, SetStateAction } from 'react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; username: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setIsSearching(true);
      

      // TODO: Replace with actual API call
      try {
        const users = await fetch(`/api/protected/findFriend/${value}`, {
          method: 'GET',
        });
        const results = await users.json();
        setSearchResults(results.users.map((x: { id: any; username: any; }) => ({ id: x.id, username: x.username })));
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">SealChat</span>
            </div>
            <div className="ml-6 flex-1 max-w-lg">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                    <ul className="max-h-60 overflow-auto py-2">
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            // Handle result click
                            router.push(`/profile/${result.username}`);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                        >
                          {result.username}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {isSearching && (
                  <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 p-4 text-center">
                    Searching...
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center">
            <Link href='/profile' className="p-2 rounded-full hover:bg-gray-100">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
