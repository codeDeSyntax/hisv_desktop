import React, { useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useBibleContext } from '@/Provider/Bible';

const SearchPanel: React.FC = () => {
  const { 
    searchOpen, 
    setSearchOpen, 
    searchTerm, 
    setSearchTerm, 
    performSearch, 
    searchResults,
    setCurrentBook,
    setCurrentChapter,
    exactMatch,
    setExactMatch,
    wholeWords,
    setWholeWords,
    sidebarExpanded
  } = useBibleContext();

  // Perform search when search term changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, exactMatch, wholeWords, performSearch]);

  if (!searchOpen) return null;

  const handleResultClick = (book: string, chapter: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setSearchOpen(false);
  };

  return (
    <div className={`fixed top-10 ${
      sidebarExpanded ? 'left-48' : 'left-12'
    } w-64 md:w-80 bg-white dark:bg-gray-900 h-[calc(100vh-2.5rem)] 
      border-r border-gray-300 dark:border-gray-700 
      transition-all duration-300 z-10 overflow-hidden flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Search</h2>
          <button onClick={() => setSearchOpen(false)} className="p-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scripture..."
            className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 
              rounded-md bg-white dark:bg-gray-800"
          />
          <Search size={18} className="absolute left-2 top-2.5 text-gray-500" />
        </div>
        
        <div className="flex flex-col mt-3 space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={() => setExactMatch(!exactMatch)}
              className="rounded text-blue-600"
            />
            <span>Exact match</span>
          </label>
          
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={wholeWords}
              onChange={() => setWholeWords(!wholeWords)}
              className="rounded text-blue-600"
            />
            <span>Whole words only</span>
          </label>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {searchResults.length} results found
        </div>
        
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleResultClick(result.book, result.chapter)}
              >
                <div className="font-medium">
                  {result.book} {result.chapter}:{result.verse}
                </div>
                <p className="text-sm mt-1 line-clamp-2">{result.text}</p>
              </div>
            ))}
          </div>
        ) : (
          searchTerm && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPanel;