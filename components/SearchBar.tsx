import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          className="w-full px-6 py-3 rounded-full bg-secondary-color 
                   border border-gray-700 focus:border-accent-color
                   focus:outline-none text-white placeholder-gray-400"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2
                   bg-accent-color hover:bg-accent-color/90 
                   text-white px-6 py-2 rounded-full
                   transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar; 