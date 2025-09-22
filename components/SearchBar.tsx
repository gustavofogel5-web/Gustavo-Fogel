
import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a song to find its chords..."
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-inner"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center px-5 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        aria-label="Search"
      >
        <SearchIcon className="w-5 h-5" />
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
};

export default SearchBar;