import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

interface SearchResult {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useOnClickOutside(searchRef, () => setShowResults(false));

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio')
          .or(`username.ilike.%${debouncedQuery}%, bio.ilike.%${debouncedQuery}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Search users..."
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 pr-10 py-2 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 
                     hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {showResults && (query.trim() !== '') && (
        <div className="absolute mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 
                      bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleUserClick(result.id)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 
                         dark:hover:bg-gray-700 text-left transition-colors duration-150"
              >
                <img
                  src={result.avatar_url || 'https://via.placeholder.com/40'}
                  alt={result.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {result.username}
                  </p>
                  {result.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {result.bio}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}