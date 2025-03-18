import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  ChevronDown,
  BookOpen,
  Share,
  Copy,
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
    currentVerse,
    setCurrentVerse,
    getBookChapterCount,
    theme,
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
  const [visibleVerses, setVisibleVerses] = useState<number[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(
    currentVerse || null
  );
  const [highlightedVerses, setHighlightedVerses] = useState<{
    [key: string]: string;
  }>({});

  const verses = getCurrentChapterVerses();
  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const chapterCount = getBookChapterCount(currentBook);

  // Remove the scroll-based history saving
  const updateVisibleVerses = () => {
    if (!contentRef.current) return;

    const container = contentRef.current;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const visibleVerseNumbers: number[] = [];

    // Check which verses are visible in the viewport
    Object.entries(verseRefs.current).forEach(([verseNum, ref]) => {
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const topRelativeToContainer = rect.top - containerRect.top;
      const bottomRelativeToContainer = rect.bottom - containerRect.top;

      // Check if verse is visible in the container
      if (
        bottomRelativeToContainer > 0 &&
        topRelativeToContainer < container.clientHeight
      ) {
        visibleVerseNumbers.push(parseInt(verseNum));
      }
    });

    if (
      visibleVerseNumbers.length > 0 &&
      visibleVerseNumbers[0] !== selectedVerse
    ) {
      setSelectedVerse(visibleVerseNumbers[0]);
      // Removed history saving from here
    }
  };

  // Add scrolling event listener
  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", updateVisibleVerses);
      return () => {
        container.removeEventListener("scroll", updateVisibleVerses);
      };
    }
  }, [contentRef.current]);

  // Fixed useEffect to prevent infinite loop
  // Remove the duplicate history saving from chapter changes
  useEffect(() => {
    // Scroll to top when chapter changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // Reset selected verse when chapter changes
    setSelectedVerse(null);
    // Close verse dropdown when chapter changes
    setIsVerseDropdownOpen(false);
  }, [currentBook, currentChapter]); // Removed addToHistory from dependencies // Don't include addToHistory in dependencies // Removed addToHistory from dependencies

  useEffect(() => {
    // If we have a currentVerse (coming from bookmarks/history), use it
    if (currentVerse && verseRefs.current[currentVerse]) {
      // Use a small delay to ensure the DOM is ready
      setTimeout(() => {
        verseRefs.current[currentVerse]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Update selectedVerse to match the current verse
        setSelectedVerse(currentVerse);
        // Don't clear currentVerse for immediate navigation feedback
      }, 100);
    }
  }, [currentVerse, currentBook, currentChapter]);

  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      // Save to history before changing
      addToHistory(`${currentBook} ${currentChapter}`);
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < chapterCount) {
      // Save to history before changing
      addToHistory(`${currentBook} ${currentChapter}`);
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

  // Add this with your other utility functions
  const highlightVerse = (verse: number, color: string) => {
    const verseKey = `${currentBook}-${currentChapter}-${verse}`;

    if (color === "reset") {
      // Remove highlighting
      const newHighlights = { ...highlightedVerses };
      delete newHighlights[verseKey];
      setHighlightedVerses(newHighlights);
    } else {
      // Add or update highlighting
      setHighlightedVerses({
        ...highlightedVerses,
        [verseKey]: color,
      });
    }
  };

  const getVerseHighlight = (verse: number) => {
    const verseKey = `${currentBook}-${currentChapter}-${verse}`;
    return highlightedVerses[verseKey] || null;
  };
  // Set font size based on user preference
  const getFontSize = () => {
    switch (fontSize) {
      case "small":
        return "text-xl";
      case "medium":
        return "text-4xl";
      case "large":
        return "text-6xl";
      case "xl":
        return "text-8xl";
      case "2xl":
        return "text-9xl";
      default:
        return "text-base";
    }
  };

  const handleShare = async (text: string, title: string) => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: window.location.href,
        });
        console.log("Content shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard if Web Share API is not available
      try {
        const shareText = `${title}\n\n${text}`;
        await navigator.clipboard.writeText(shareText);

        // Show a temporary notification
        const notification = document.createElement("div");
        notification.textContent = "Copied to clipboard!";
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.left = "50%";
        notification.style.transform = "translateX(-50%)";
        notification.style.backgroundColor =
          theme === "dark" ? "#333" : "#f0f0f0";
        notification.style.color = theme === "dark" ? "#fff" : "#333";
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "5px";
        notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        notification.style.zIndex = "1000";

        document.body.appendChild(notification);

        // Remove the notification after 2 seconds
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        alert(
          "Failed to copy to clipboard. Your browser may not support this feature."
        );
      }
    }
  };

  // Set font family based on user preference

  // When selecting a different book
  const handleBookSelect = (book: string) => {
    // Save to history before changing
    if (currentBook !== book) {
      addToHistory(`${currentBook} ${currentChapter}`);
    }

    setCurrentBook(book);
    setCurrentChapter(1);
    setIsBookDropdownOpen(false);
    // Open chapter dropdown after selecting a book
    setTimeout(() => {
      setIsChapterDropdownOpen(true);
    }, 100);
  };

  // When selecting a different chapter
  const handleChapterSelect = (chapter: number) => {
    // Save to history before changing
    if (currentChapter !== chapter) {
      addToHistory(`${currentBook} ${currentChapter}`);
    }

    setCurrentChapter(chapter);
    setIsChapterDropdownOpen(false);
    // Open verse dropdown after selecting a chapter
    setTimeout(() => {
      setIsVerseDropdownOpen(true);
    }, 100);
  };

  // When explicitly selecting a verse from the dropdown
  const handleVerseSelect = (verse: number) => {
    setSelectedVerse(verse);
    setIsVerseDropdownOpen(false);
    // Scroll to the verse immediately
    if (verseRefs.current[verse]) {
      verseRefs.current[verse]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Add verse reference to history when explicitly selected
    addToHistory(`${currentBook} ${currentChapter}:${verse}`);
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
                            ? "bg-gray-500 dark:bg-bgray/50 text-white dark:text-gray-50 font-medium"
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
              <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar">
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
              <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar">
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
        className="flex-1  p-4 md:p-6 lg:p-8 overflow-y-scroll no-scrollbar text-stone-500 bg-white dark:bg-black"
        onScroll={updateVisibleVerses}
      >
        {verses.length > 0 ? (
          <div
            className={`space-y-4 ${getFontSize()} }`}
            style={{
              fontFamily: fontFamily,
            }}
          >
            {verses.map((verse) => (
              <div
                key={verse.verse}
                className={`flex group p-2 rounded-md hover:bg-gray-50 dark:hover:bg-bgray transition-colors duration-150 bg-transparent `}
                ref={(el) => (verseRefs.current[verse.verse] = el)}
              >
                <span
                  className="text-primary mr-3 pt-1  font-medium"
                  style={{
                    fontSize: getFontSize(),
                  }}
                >
                  {verse.verse}
                </span>
                <div className="flex- leading-normal text-wrap ">
                  <p
                    className="text-wrap break-words scripturetext p-2"
                    style={{
                      color:
                        getVerseHighlight(verse.verse) ||
                        (theme === "dark"
                          ? verseTextColor || "#f9fafb"
                          : verseTextColor || "#78716c"),
                      backgroundColor: getVerseHighlight(verse.verse)
                        ? `${getVerseHighlight(verse.verse)}22` // Add transparency to the highlight color
                        : "transparent",
                      fontSize: getFontSize(),
                      fontFamily: fontFamily,
                    }}
                  >
                    {formatVerseText(verse.text)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(verse.verse)}
                    className="opacity-0 flex outline-none border-none items-center justify-center h-10 w-10 shadow bg-white group-hover:opacity-100 dark:bg-ltgray  p-1 ml-2 transition-opacity duration-200 rounded-full dark:hover:bg-gray-800 hover:bg-gray-200"
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
                  <button
                    onClick={() =>
                      handleShare(
                        `${currentBook} ${currentChapter}:${verse.verse}`,
                        verse.text
                      )
                    }
                    className="opacity-0 flex items-center justify-center h-10 w-10  bg-white dark:bg-ltgray shadow-sm group-hover:opacity-100 p-1 ml-2 transition-opacity duration-200 dark:hover:bg-gray-800 hover:bg-gray-200 rounded-full"
                    title={
                      isBookmarked(verse.verse)
                        ? "Remove bookmark"
                        : "Add bookmark"
                    }
                  >
                    <Copy size={16} className="text-primary" />
                  </button>

                  <div className="opacity-0 flex flex-col items-center justify-center gap-1  group-hover:opacity-100 p-1 ml-2 transition-opacity duration-200 rounded-full">
                    {/* Yellow highlight */}
                    <div
                      onClick={() => highlightVerse(verse.verse, "#FFD700")}
                      className="h-6 w-6 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm"
                      title="Highlight yellow"
                    ></div>
                    {/* Green highlight */}
                    <div
                      onClick={() => highlightVerse(verse.verse, "#4CAF50")}
                      className="h-6 w-6 rounded-full bg-green-500 hover:bg-green-600 shadow-sm"
                      title="Highlight green"
                    ></div>
                    {/* Blue highlight */}
                    <div
                      onClick={() => highlightVerse(verse.verse, "#2196F3")}
                      className="h-6 w-6 rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm"
                      title="Highlight blue"
                    ></div>
                    {/* Reset highlight */}
                    <div
                      onClick={() => highlightVerse(verse.verse, "reset")}
                      className="h-6 w-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-sm"
                      title="Remove highlight"
                    >
                      <span className="text-xs">×</span>
                    </div>
                  </div>
                </div>
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
