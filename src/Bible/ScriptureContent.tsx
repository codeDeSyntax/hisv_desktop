import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

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
    currentTranslation,
  } = useBibleContext();

  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const verses = getCurrentChapterVerses();
  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
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
  }, [currentBook, currentChapter]); // Removed addToHistory from dependencies

  useEffect(() => {
    // Scroll to selected verse
    if (selectedVerse && verseRefs.current[selectedVerse]) {
      verseRefs.current[selectedVerse]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
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
      case "small":
        return "text-sm";
      case "medium":
        return "text-xl";
      case "large":
        return "text-3xl";
      case "xl":
        return "text-5xl";
      case "2xl":
        return "text-7xl";
      default:
        return "text-base";
    }
  };

  // Set font family based on user preference
  const getFontFamily = () => {
    switch (fontFamily) {
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-serif";
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
    return bookData?.chapters.map((chapter) => chapter.chapter) || [];
  };

  const getVerses = () => {
    return verses.map((verse) => verse.verse);
  };

  const formatVerseText = (text: string) => {
    // Split the text by the special Unicode characters
    const parts = text.split(/[\u2039\u203a]/);
    // If there are no splits (no special characters found), return the plain text
    if (parts.length <= 1) return text;

    // Initialize result array to hold the formatted parts
    const result = [];

    // Determine if we start inside or outside a quoted section
    let isInside = false;

    // Process each part
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        if (isInside) {
          // If we're inside the special brackets, apply the red color
          result.push(
            <span key={i} style={{ color: "red" }}>
              {parts[i]}
            </span>
          );
        } else {
          // Otherwise, use the normal text color
          result.push(<span key={i}>{parts[i]}</span>);
        }
      }
      // Toggle the inside/outside state for the next part
      isInside = !isInside;
    }

    return result;
  };

  const oldTestamentBooks = bookList.filter((book) => book.testament === "old");
  const newTestamentBooks = bookList.filter((book) => book.testament === "new");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".book-dropdown") && isBookDropdownOpen) {
        setIsBookDropdownOpen(false);
      }
      if (!target.closest(".chapter-dropdown") && isChapterDropdownOpen) {
        setIsChapterDropdownOpen(false);
      }
      if (!target.closest(".verse-dropdown") && isVerseDropdownOpen) {
        setIsVerseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  return (
    <div className="flex flex-col h-full bg-red-500 dark:bg-black text-white">
      {/* Single-row navigation bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-white dark:bg-black">
        <button
          onClick={handlePreviousChapter}
          disabled={currentChapter <= 1}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-50  bg-gray-200 dark:bg-bgray shadow  hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ChevronLeft size={14} className="text-[12px]" />
        </button>

        <div className="flex items-center space-x-2">
          {/* Book selector */}
          <div className="relative book-dropdown">
            <button
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-bgray focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-gray-300 transition-colors duration-200"
              onClick={() => {
                setIsBookDropdownOpen(!isBookDropdownOpen);
                setIsChapterDropdownOpen(false);
                setIsVerseDropdownOpen(false);
              }}
            >
              <BookOpen size={16} className="text-gray-400 text-[12px]" />
              <span className="text-[12px] font-medium text-stone-500 dark:text-gray-50">
                {currentBook}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-gray-400 ${
                  isBookDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isBookDropdownOpen && (
              <div className="absolute left-0 mt-2 w-[40vw] bg-white dark:bg-bgray  rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto no-scrollbar">
                <div className="p-3">
                  <h2 className="text-sm font-semibold mb-2 text-stone-400">
                    Old Testament
                  </h2>
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {oldTestamentBooks.map((book) => (
                      <div
                        key={book.name}
                        className={`py-2 px-1 text-[12px] flex items-center justify-center text-stone-400 cursor-pointer shadow  dark:shadow-black  rounded hover:bg-gray-500 dark:hover:bg-bgray/30 hover:text-white transition-colors duration-150 ${
                          currentBook === book.name
                            ? "bg-gray-500 dark:bg-bgray/50 text-stone-500 dark:text-gray-50 font-medium"
                            : ""
                        }`}
                        onClick={() => handleBookSelect(book.name)}
                      >
                        {book.name}
                      </div>
                    ))}
                  </div>
                  <h2 className="text-sm font-semibold mb-2 pt-2 border-t border-gray-800 text-stone-400">
                    New Testament
                  </h2>
                  <div className="grid grid-cols-3 gap-1">
                    {newTestamentBooks.map((book) => (
                      <div
                        key={book.name}
                        className={`p-2 text-[12px] flex items-center justify-center text-stone-400 dark:shadow-black cursor-pointer shadow rounded hover:bg-gray-500
                          dark:hover:bg-bgray/30 hover:text-white transition-colors duration-150 ${
                            currentBook === book.name
                              ? "bg-gray-500 text-white dark:bg-bgray/50  dark:text-gray-50 font-medium"
                              : ""
                          }`}
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
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-bgray focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-gray-300 transition-colors duration-200 text-stone-500 dark:text-gray-50"
              onClick={() => {
                setIsChapterDropdownOpen(!isChapterDropdownOpen);
                setIsBookDropdownOpen(false);
                setIsVerseDropdownOpen(false);
              }}
            >
              <span className="text-[12px] font-medium">{currentChapter}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200    text-gray-400 ${
                  isChapterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isChapterDropdownOpen && (
              <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-5 gap-1">
                  {getChapters().map((chapter) => (
                    <div
                      key={chapter}
                      className={`p-2 text-[12px] flex items-center justify-center  dark:shadow-black cursor-pointer shadow rounded hover:bg-gray-500 dark:hover:bg-bgray/30 hover:text-white transition-colors duration-150 ${
                        currentChapter === chapter
                          ? "bg-gray-500 dark:bg-bgray/50 text-white dark:text-gray-50 font-medium"
                          : "text-stone-500"
                      }`}
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
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-bgray focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-gray-300 transition-colors duration-200"
              onClick={() => {
                setIsVerseDropdownOpen(!isVerseDropdownOpen);
                setIsBookDropdownOpen(false);
                setIsChapterDropdownOpen(false);
              }}
            >
              <span className="text-[12px] font-medium text-stone-500 dark:text-gray-50">
                v {selectedVerse || "?"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-gray-400 ${
                  isVerseDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isVerseDropdownOpen && (
              <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-5 gap-1">
                  {getVerses().map((verse) => (
                    <div
                      key={verse}
                      className={`p-2 text-[12px] flex items-center justify-center text-stone-400 dark:shadow-black cursor-pointer shadow rounded hover:bg-gray-500 dark:hover:bg-bgray/30 hover:text-white transition-colors duration-150 ${
                        selectedVerse === verse
                          ? "bg-gray-500 text-white font-medium"
                          : ""
                      }`}
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
          className="p-2 rounded-lg bg-gray-200 dark:bg-bgray shadow  hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-20 text-stone-500 dark:text-gray-50"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Scripture content */}
      <div
        ref={contentRef}
        className="flex-1  p-4 md:p-6 lg:p-8 overflow-y-scroll no-scrollbar bg-white dark:bg-black"
      >
        {verses.length > 0 ? (
          <div className={`space-y-4 ${getFontSize()} ${getFontFamily()}`}>
            {verses.map((verse) => (
              <div
                key={verse.verse}
                className={`flex group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-bgray transition-colors duration-150 bg-transparent hover:cursor-pointer`}
                ref={(el) => (verseRefs.current[verse.verse] = el)}
              >
                <span className="text-gray-500 mr-3 pt-1  font-medium" style={{
                  fontSize:getFontSize()
                }}>
                  {verse.verse}
                </span>
                <div className="flex-1 leading-normal  ">
                  <p
                    style={{
                      color: verseTextColor || "#ffffff",
                      fontSize: getFontSize(),
                    }}
                  >
                    {formatVerseText(verse.text)}
                  </p>
                </div>
                <button
                  onClick={() => toggleBookmark(verse.verse)}
                  className="opacity-0 flex items-center justify-center h-10 w-10 shadow bg-gray-400 group-hover:opacity-100 p-1 ml-2 transition-opacity duration-200 hover:bg-gray-800 rounded-full"
                  title={
                    isBookmarked(verse.verse)
                      ? "Remove bookmark"
                      : "Add bookmark"
                  }
                >
                  {isBookmarked(verse.verse) ? (
                    <Star size={16} className="text-primary" />
                  ) : (
                    <StarOff size={16} className="text-primary" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading scripture content...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptureContent;
