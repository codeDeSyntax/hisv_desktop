import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, StarOff, ChevronDown, BookOpen } from 'lucide-react';
import { useBibleContext } from '@/Provider/Bible';

interface Book {
  name: string;
  testament: string;
  chapters: { chapter: number }[];
}

const ScriptureContent: React.FC = () => {
  const { 
    getCurrentChapterVerses,
    currentBook,
    setCurrentBook,
    currentChapter,
    setCurrentChapter,
    getBookChapterCount,
    fontSize,
    fontFamily,
    verseTextColor,
    bookmarks,
    addBookmark,
    removeBookmark,
    addToHistory,
    bookList,
    bibleData,
    currentTranslation
  } = useBibleContext();

  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const verses = getCurrentChapterVerses();
  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const chapterCount = getBookChapterCount(currentBook);

  // Fixed useEffect to prevent infinite loop
  useEffect(() => {
    // Add to history when chapter changes
    if (currentBook && currentChapter) {
      addToHistory(`${currentBook} ${currentChapter}`);
    }

    // Scroll to top when chapter changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    
    // Reset selected verse when chapter changes
    setSelectedVerse(null);
    // Close verse dropdown when chapter changes
    setIsVerseDropdownOpen(false);
  }, [currentBook, currentChapter]);  // Removed addToHistory from dependencies

  useEffect(() => {
    // Scroll to selected verse
    if (selectedVerse && verseRefs.current[selectedVerse]) {
      verseRefs.current[selectedVerse]?.scrollIntoView({
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }, [selectedVerse]);

  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < chapterCount) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const isBookmarked = (verse: number) => {
    return bookmarks.includes(`${currentBook} ${currentChapter}:${verse}`);
  };

  const toggleBookmark = (verse: number) => {
    const reference = `${currentBook} ${currentChapter}:${verse}`;
    if (isBookmarked(verse)) {
      removeBookmark(reference);
    } else {
      addBookmark(reference);
    }
  };

  // Set font size based on user preference
  const getFontSize = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      default: return 'text-base';
    }
  };

  // Set font family based on user preference
  const getFontFamily = () => {
    switch (fontFamily) {
      case 'serif': return 'font-serif';
      case 'sans': return 'font-sans';
      case 'mono': return 'font-mono';
      default: return 'font-serif';
    }
  };

  const handleBookSelect = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
    setIsBookDropdownOpen(false);
    // Open chapter dropdown after selecting a book
    setTimeout(() => {
      setIsChapterDropdownOpen(true);
    }, 100);
  };

  const handleChapterSelect = (chapter: number) => {
    setCurrentChapter(chapter);
    setIsChapterDropdownOpen(false);
    // Open verse dropdown after selecting a chapter
    setTimeout(() => {
      setIsVerseDropdownOpen(true);
    }, 100);
  };
  
  const handleVerseSelect = (verse: number) => {
    setSelectedVerse(verse);
    setIsVerseDropdownOpen(false);
  };

  const getChapters = () => {
    const bookData = bibleData[currentTranslation]?.books.find(
      (b: Book) => b.name === currentBook
    );
    return bookData?.chapters.map(chapter => chapter.chapter) || [];
  };

  const getVerses = () => {
    return verses.map(verse => verse.verse);
  };

  const oldTestamentBooks = bookList.filter(book => book.testament === 'old');
  const newTestamentBooks = bookList.filter(book => book.testament === 'new');
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.book-dropdown') && isBookDropdownOpen) {
        setIsBookDropdownOpen(false);
      }
      if (!target.closest('.chapter-dropdown') && isChapterDropdownOpen) {
        setIsChapterDropdownOpen(false);
      }
      if (!target.closest('.verse-dropdown') && isVerseDropdownOpen) {
        setIsVerseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Single-row navigation bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black">
        <button 
          onClick={handlePreviousChapter}
          disabled={currentChapter <= 1}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center space-x-2">
          {/* Book selector */}
          <div className="relative book-dropdown">
            <button
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => {
                setIsBookDropdownOpen(!isBookDropdownOpen);
                setIsChapterDropdownOpen(false);
                setIsVerseDropdownOpen(false);
              }}
            >
              <BookOpen size={16} className="text-gray-400" />
              <span className="text-base font-medium">{currentBook}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-gray-400 ${isBookDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isBookDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto no-scrollbar">
                <div className="p-3">
                  <h2 className="text-sm font-semibold mb-2 text-gray-400">Old Testament</h2>
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {oldTestamentBooks.map(book => (
                      <div 
                        key={book.name} 
                        className={`p-2 text-sm cursor-pointer rounded hover:bg-gray-800 transition-colors duration-150 ${currentBook === book.name ? 'bg-blue-900 font-medium' : ''}`}
                        onClick={() => handleBookSelect(book.name)}
                      >
                        {book.name}
                      </div>
                    ))}
                  </div>
                  <h2 className="text-sm font-semibold mb-2 pt-2 border-t border-gray-800 text-gray-400">New Testament</h2>
                  <div className="grid grid-cols-3 gap-1">
                    {newTestamentBooks.map(book => (
                      <div 
                        key={book.name} 
                        className={`p-2 text-sm cursor-pointer rounded hover:bg-gray-800 transition-colors duration-150 ${currentBook === book.name ? 'bg-blue-900 font-medium' : ''}`}
                        onClick={() => handleBookSelect(book.name)}
                      >
                        {book.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chapter selector */}
          <div className="relative chapter-dropdown">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => {
                setIsChapterDropdownOpen(!isChapterDropdownOpen);
                setIsBookDropdownOpen(false);
                setIsVerseDropdownOpen(false);
              }}
            >
              <span className="text-base font-medium">{currentChapter}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-gray-400 ${isChapterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isChapterDropdownOpen && (
              <div className="absolute mt-2 w-52 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-5 gap-1">
                  {getChapters().map(chapter => (
                    <div 
                      key={chapter} 
                      className={`p-2 text-center cursor-pointer rounded hover:bg-gray-800 ${currentChapter === chapter ? 'bg-blue-900 font-medium' : ''}`}
                      onClick={() => handleChapterSelect(chapter)}
                    >
                      {chapter}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Verse selector */}
          <div className="relative verse-dropdown">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => {
                setIsVerseDropdownOpen(!isVerseDropdownOpen);
                setIsBookDropdownOpen(false);
                setIsChapterDropdownOpen(false);
              }}
            >
              <span className="text-base font-medium">v {selectedVerse || '?'}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-gray-400 ${isVerseDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isVerseDropdownOpen && (
              <div className="absolute mt-2 w-52 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-5 gap-1">
                  {getVerses().map(verse => (
                    <div 
                      key={verse} 
                      className={`p-2 text-center cursor-pointer rounded hover:bg-gray-800 ${selectedVerse === verse ? 'bg-blue-900 font-medium' : ''}`}
                      onClick={() => handleVerseSelect(verse)}
                    >
                      {verse}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleNextChapter}
          disabled={currentChapter >= chapterCount}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Scripture content */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 overflow-y-scroll no-scrollbar bg-black"
      >
        {verses.length > 0 ? (
          <div className={`space-y-4 ${getFontSize()} ${getFontFamily()}`}>
            {verses.map((verse) => (
              <div 
                key={verse.verse} 
                className={`flex group p-2 rounded-md hover:bg-gray-900 transition-colors duration-150 ${selectedVerse === verse.verse ? 'bg-gray-900' : ''}`}
                ref={el => verseRefs.current[verse.verse] = el}
              >
                <span className="text-gray-500 mr-3 pt-1 text-sm font-medium">
                  {verse.verse}
                </span>
                <div className="flex-1">
                  <p style={{ color: verseTextColor || '#ffffff' }}>{verse.text}</p>
                </div>
                <button 
                  onClick={() => toggleBookmark(verse.verse)}
                  className="opacity-0 group-hover:opacity-100 p-1 ml-2 transition-opacity duration-200 hover:bg-gray-800 rounded-full"
                  title={isBookmarked(verse.verse) ? "Remove bookmark" : "Add bookmark"}
                >
                  {isBookmarked(verse.verse) ? (
                    <Star size={16} className="text-yellow-500" />
                  ) : (
                    <StarOff size={16} className="text-gray-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Loading scripture content...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptureContent;