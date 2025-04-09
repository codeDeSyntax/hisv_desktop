import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  ChevronDown,
  BookOpen,
  Share,
  Copy,
  Monitor,
  Upload,
} from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";
import { useEastVoiceContext } from "@/Provider/EastVoice";
import PresentationOverlay from "./PresentationOverlay";

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

  const { bibleBgs } = useEastVoiceContext();

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
  const [presentationCurrentVerse, setPresentationCurrentVerse] =
    useState<number>(1);
  const [presentationNavigation, setPresentationNavigation] = useState<{
    book: string;
    chapter: number;
    verse: number;
  }>({
    book: currentBook,
    chapter: currentChapter,
    verse: 1,
  });
  const [showDropdown, setShowdropdown] = useState(false);

  const verses = getCurrentChapterVerses();
  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const chapterCount = getBookChapterCount(currentBook);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [activeDropdownVerse, setActiveDropdownVerse] = useState<number | null>(
    null
  );
  const [isPresentingVerse, setIsPresentingVerse] = useState(false);
  const [presentationText, setPresentationText] = useState("");
  const [presentationBg, setPresentationBg] = useState("");

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

  useEffect(() => {
    // Scroll to top when chapter changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // Reset selected verse when chapter changes
    setSelectedVerse(null);
    // Close verse dropdown when chapter changes
    setIsVerseDropdownOpen(false);
  }, [currentBook, currentChapter, currentVerse]);

  useEffect(() => {
    // If we have a currentVerse (coming from bookmarks/history), use it
    if (currentVerse && verseRefs.current[currentVerse]) {
      // Use a small delay to ensure the DOM is ready
      console.log("selectedV verse sc: ", selectedVerse);
      setTimeout(() => {
        verseRefs.current[currentVerse]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });

        // setSelectedVerse(currentVerse);
        // Update selectedVerse to match the current verse
        // Don't clear currentVerse for immediate navigation feedback
      }, 300);
    }
  }, [currentVerse, currentBook, currentChapter]);

  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      // Save to history before changing
      addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`);
      setCurrentChapter(currentChapter - 1);
    }
    setCurrentVerse(1);
  };

  // const setV = () => {
  //   setSelectedVerse(currentVerse);
  //   if (currentVerse && verseRefs.current[currentVerse]) {
  //     // Use a small delay to ensure the DOM is ready
  //     console.log("selectedV verse sc: ", selectedVerse);
  //     setTimeout(() => {
  //       verseRefs.current[currentVerse]?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start",
  //         inline: "nearest",
  //       });

  //       // setSelectedVerse(currentVerse);
  //       // Update selectedVerse to match the current verse
  //       // Don't clear currentVerse for immediate navigation feedback
  //     }, 100);
  //   }
  // };

  const handleNextChapter = () => {
    if (currentChapter < chapterCount) {
      // Save to history before changing
      addToHistory(`${currentBook} ${currentChapter}`);
      setCurrentChapter(currentChapter + 1);
      setCurrentVerse(1);
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

  const toggleShowPresentationBgs = (verseNumber: number) => {
    if (activeDropdownVerse === verseNumber) {
      // If clicking on the same verse, toggle off
      setActiveDropdownVerse(null);
    } else {
      // If clicking on a different verse, show dropdown for that verse
      setActiveDropdownVerse(verseNumber);
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

  const handleBookSelect = (book: string) => {
    // Save to history before changing
    if (currentBook !== book) {
      addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`);
    }

    setCurrentBook(book);
    setCurrentChapter(1);
    setCurrentVerse(1); // Explicitly set verse to 1
    setSelectedVerse(1); // Ensure selected verse is 1
    setIsBookDropdownOpen(false);

    // Ensure scroll to top
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // Open chapter dropdown after selecting a book
    setTimeout(() => {
      setIsChapterDropdownOpen(true);
    }, 100);
  };

  // Modify handleChapterSelect to ensure verse is set to 1 and scrolled to top
  const handleChapterSelect = (chapter: number) => {
    // Save to history before changing
    if (currentChapter !== chapter) {
      addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`);
    }

    setCurrentChapter(chapter);
    setCurrentVerse(1); // Explicitly set verse to 1
    setSelectedVerse(1); // Ensure selected verse is 1
    setIsChapterDropdownOpen(false);

    // Ensure scroll to top
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

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

  const formatVerseText = (text: string, highlightColor: string | null) => {
    // First handle the special Unicode character formatting (red text)
    // Split the text by the special Unicode characters
    const parts = text.trim().split(/[\u2039\u203a]/);

    // If there are no splits (no special characters found) and no highlight color, return the plain text
    if (parts.length <= 1 && !highlightColor) return text;

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
            <span
              key={`red-${i}`}
              style={{ color: "red" }}
              className="underline"
            >
              {parts[i]}
            </span>
          );
        } else {
          // Apply highlight if specified, otherwise use normal text
          result.push(
            <span
              key={`normal-${i}`}
              style={
                highlightColor
                  ? {
                      backgroundColor: `${highlightColor}80`,
                      color: `${verseTextColor}`,
                      textDecoration: "underline",
                    }
                  : {}
              }
            >
              {parts[i]}
            </span>
          );
        }
      }
      // Toggle the inside/outside state for the next part
      isInside = !isInside;
    }

    return result;
  };
  const handlePresentVerse = (text: string, bgSrc: string, verse: number) => {
    setPresentationText(text);
    setPresentationBg(bgSrc);

    // Set initial presentation navigation state
    setPresentationNavigation({
      book: currentBook,
      chapter: currentChapter,
      verse: verse,
    });
    setPresentationCurrentVerse(verse);
    setIsPresentingVerse(true);
  };

  // New method to handle presentation navigation
  const handlePresentationNavigation = (direction: "prev" | "next") => {
    const currentVerses = getCurrentChapterVerses();
    const currentVerseIndex = currentVerses.findIndex(
      (v) => v.verse === presentationCurrentVerse
    );
    const chapterVerseCount = currentVerses.length;

    if (direction === "next" && currentVerseIndex < chapterVerseCount - 1) {
      const nextVerse = currentVerses[currentVerseIndex + 1];
      setPresentationCurrentVerse(nextVerse.verse);
      setPresentationText(nextVerse.text);
    } else if (direction === "prev" && currentVerseIndex > 0) {
      const prevVerse = currentVerses[currentVerseIndex - 1];
      setPresentationCurrentVerse(prevVerse.verse);
      setPresentationText(prevVerse.text);
    }
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

  const iconColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`;
    };

    return {
      color1: generateRandomColor(),
      color2: generateRandomColor(),
      color3: generateRandomColor(),
      color4: generateRandomColor(),
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-red-500 dark:bg-black text-white font-serif">
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
              <span className="text-[12px] font-bold text-stone-500 dark:text-gray-50 font-serif ">
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
                  <h2 className="text-sm flex items-center justify-between font-semibold mb-2 font-serif text-stone-400">
                    Old Testament {"   "}
                    <span
                      className="underline font-serif"
                      style={{ 
                        color: iconColors.color2,
                      }}
                    >
                      Bk:: {currentBook}
                      {currentChapter}:
                      {currentVerse === null ? "1" : currentVerse}
                    </span>
                  </h2>
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {oldTestamentBooks.map((book) => (
                      <div
                        key={book.name}
                        className={`p-2 text-[12px] flex items-center justify-center  dark:shadow-black shadow rounded   transition-colors duration-150 ${
                          currentBook === book.name
                            ? "bg-transparent text-stone-500  hover:text-stone-900 cursor-not-allowed dark:text-gray-50 font-medium"
                            : "text-stone-400 dark:text-gray-400 cursor-pointer   hover:text-stone-500 dark:hover:text-gray-200"
                        }`}
                        onClick={() => handleBookSelect(book.name)}
                        style={{
                          borderWidth: 2,
                          borderStyle:
                            currentBook === book.name ? "dotted" : "none",
                          borderColor:
                            currentBook === book.name
                              ? iconColors.color1
                              : iconColors.color2,
                        }}
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
                        className={`p-2 text-[12px] flex items-center justify-center  dark:shadow-black cursor-pointer shadow rounded   transition-colors duration-150 ${
                          currentBook === book.name
                            ? "bg-transparent text-stone-500  hover:text-stone-900 pointer-events-none dark:text-gray-50 font-medium"
                            : "text-stone-400 dark:text-gray-400 cursor-pointer   hover:text-stone-500 dark:hover:text-gray-200"
                        }`}
                        onClick={() => handleBookSelect(book.name)}
                        style={{
                          borderWidth: 2,
                          borderStyle:
                            currentBook === book.name ? "dotted" : "none",
                          borderColor:
                            currentBook === book.name
                              ? iconColors.color3
                              : iconColors.color4,
                        }}
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
              <span className="text-[12px] font-medium font-bitter">
                {currentChapter}
              </span>
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
                      className={`p-2 text-[12px] flex items-center justify-center  dark:shadow-black shadow rounded   transition-colors duration-150 ${
                        currentChapter === chapter
                          ? "bg-transparent text-stone-500  hover:text-stone-900 pointer-events-none hover:cursor-pointer dark:text-gray-50 font-medium"
                          : "text-stone-500 dark:text-gray-400 cursor-pointer   hover:text-stone-500 dark:hover:text-gray-200"
                      }`}
                      onClick={() => handleChapterSelect(chapter)}
                      style={{
                        borderWidth: 2,
                        borderStyle:
                          currentChapter === chapter ? "dotted" : "none",
                        borderColor:
                          currentChapter === chapter
                            ? iconColors.color2
                            : iconColors.color4,
                      }}
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
              <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
                v {selectedVerse || "🤐"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-gray-400 ${
                  isVerseDropdownOpen ? "rotate-180" : ""
                }`}
              />
              {/* <Upload className="" onClick={setV} /> */}
            </button>

            {isVerseDropdownOpen && (
              <div className="absolute mt-2 w-52 bg-white dark:bg-bgray border border-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar">
                <div className="p-2 grid grid-cols-5 gap-1">
                  {getVerses().map((verse) => (
                    <div
                      key={verse}
                      className={`p-2 text-[12px] flex items-center justify-center  dark:shadow-black  shadow rounded   transition-colors duration-150 ${
                        currentVerse === verse
                          ? "bg-transparent text-stone-500  hover:text-stone-900 cursor-not-allowed pointer-events-none dark:text-gray-50 font-medium"
                          : "text-stone-400 dark:text-gray-400 cursor-pointer   hover:text-stone-500 dark:hover:text-gray-200"
                      }`}
                      onClick={() => handleVerseSelect(verse)}
                      style={{
                        borderWidth: 2,
                        borderStyle:
                          selectedVerse === verse ? "dotted" : "none",
                        borderColor:
                          selectedVerse === verse
                            ? iconColors.color1
                            : iconColors.color2,
                      }}
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
      <PresentationOverlay
        backgroundSrc={presentationBg}
        text={presentationText}
        isPresenting={isPresentingVerse}
        onClose={() => setIsPresentingVerse(false)}
        onNext={() => handlePresentationNavigation("next")}
        onPrev={() => handlePresentationNavigation("prev")}
        currentVerse={presentationCurrentVerse}
        totalVerses={getCurrentChapterVerses().length}
      />
      {/* Scripture content */}
      <div
        ref={contentRef}
        className="flex-1  p-4 md:p-6 lg:p-8 overflow-y-scroll no-scrollbar text-stone-500 bg-white dark:bg-black"
        onScroll={updateVisibleVerses}
      >
        {verses.length > 0 ? (
          <div
            className={`flex flex-col  ${getFontSize()} }`}
            style={{
              fontFamily: fontFamily,
            }}
          >
            {verses.map((verse) => (
              <div
                key={verse.verse.toString().trim()}
                className="relative group py-2 rounded-md hover:bg-gray-50 dark:hover:bg-bgray/40  transition-colors duration-150 bg-transparent"
                ref={(el) => (verseRefs.current[verse.verse] = el)}
              >
                <div className="flex items-start">
                  {/* Verse number */}
                  <div className="flex-shrink-0  text-center pt-1 mb-10 ml-4  ">
                    <span
                      className="text-primary font-cooper font- skew-   inline-block"
                      style={{ fontSize: "0.75em" }}
                    >
                      {verse.verse}
                    </span>
                  </div>

                  {/* Verse text */}
                  <div className="flex-grow">
                    <p
                      className={`text-left leading-normal p-2 px-3 ${
                        theme === "dark" ? "text-gray-50" : "text-red-500"
                      } scripturetext pr-10`}
                      style={{
                        color:
                          getVerseHighlight(verse.verse) ||
                          (theme === "dark"
                            ? verseTextColor || "#f9fafb"
                            : verseTextColor || "#78716c"),
                        // backgroundColor: getVerseHighlight(verse.verse)
                        //   ? `${getVerseHighlight(verse.verse)}22` // Add transparency to the highlight color
                        //   : "transparent",
                        fontSize: getFontSize(),
                        fontFamily: fontFamily,
                      }}
                    >
                      {formatVerseText(
                        verse.text,
                        getVerseHighlight(verse.verse)
                      )}
                    </p>
                  </div>
                </div>

                {/* Action buttons - absolutely positioned */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex flex-row items-start gap-1">
                    <button
                      onClick={() => toggleBookmark(verse.verse)}
                      className="flex outline-none border-none items-center justify-center h-6 w-6 shadow bg-white dark:bg-ltgray p-1 rounded-full dark:hover:bg-gray-800 hover:bg-gray-200"
                      title={
                        isBookmarked(verse.verse)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                    >
                      {isBookmarked(verse.verse) ? (
                        <Star size={12} className="text-primary" />
                      ) : (
                        <StarOff size={12} className="text-primary" />
                      )}
                    </button>

                    <button
                      onClick={() =>
                        handleShare(
                          `${currentBook} ${currentChapter}:${verse.verse}`,
                          verse.text
                        )
                      }
                      className="flex items-center justify-center h-6 w-6 bg-white dark:bg-ltgray shadow-sm p-1 rounded-full dark:hover:bg-gray-800 hover:bg-gray-200"
                      title="Share or copy verse"
                    >
                      <Copy size={12} className="text-primary" />
                    </button>

                    <div
                      onClick={() => toggleShowPresentationBgs(verse.verse)}
                      className="flex outline-none border-none items-center justify-center h-6 w-6 shadow bg-white dark:bg-ltgray p-1 rounded-full cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-200 relative"
                      title="Show presentation backgrounds"
                    >
                      <Monitor className="text-primary z-20 size-3" />

                      {/* Dropdown menu - only show for the active verse */}
                      {activeDropdownVerse === verse.verse && (
                        <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 shadow-md rounded-md p-1 z-10 w-auto">
                          <div className="flex flex-row -space-x-2 overflow-x-auto py-1 px-1 max-w-40">
                            {bibleBgs.length === 0 &&
                              "No backgrounds available"}
                            {bibleBgs?.map((bg, index) => (
                              <img
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePresentVerse(
                                    verse.text,
                                    bg || bibleBgs[0],
                                    verse.verse
                                  );
                                }}
                                style={{
                                  borderWidth: 2,
                                  borderStyle: "dashed",
                                  borderColor:
                                    theme === "dark" ? "#f9fafb" : "#78716c",
                                }}
                                src={bg}
                                alt={`Bg ${index + 1}`}
                                className={`h-6 w-6 object-cover hover:cursor-pointer rounded-full border-2 border-white dark:border-gray-700
                    ${selectedBg === bg ? "ring-2 ring-primary z-10" : ""}
                    `}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Highlight color options */}
                    <div className="flex flex-row items-center gap-1 bg-white dark:bg-ltgray p-1 rounded-full shadow">
                      {/* Yellow highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "#FFD700")}
                        className="h-4 w-4 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm cursor-pointer"
                        title="Highlight yellow"
                      ></div>
                      {/* Green highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "#4CAF50")}
                        className="h-4 w-4 rounded-full bg-green-500 hover:bg-green-600 shadow-sm cursor-pointer"
                        title="Highlight green"
                      ></div>
                      {/* Blue highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "#2196F3")}
                        className="h-4 w-4 rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm cursor-pointer"
                        title="Highlight blue"
                      ></div>
                      {/* Reset highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "reset")}
                        className="h-4 w-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-sm cursor-pointer"
                        title="Remove highlight"
                      >
                        <span className="text-xs">×</span>
                      </div>
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
