import React, {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { Card, Button, theme } from "antd";
import DownloadSermon from "./PlayDownload";
import {
  ImageIcon,
  Search,
  X,
  Info,
  Menu,
  ChevronUp,
  ChevronDown,
  BookOpen,
  BookmarkCheck,
  Bookmark,
  TextIcon,
  TextSelectIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Sermon } from "@/types";
import { useSermonContext } from "@/Provider/Vsermons";
import TypingVerse from "@/components/TypingText";
import { useTheme } from "@/Provider/Theme";
import {
  formatSermonIntoParagraphs,
  formatSermonIntoParagraphsAsync,
  searchSermon,
} from "@/utils/sermonUtils";

// Import modular components
import {
  SaveNotification,
  FloatingControlButton,
  ColorPalette,
  ReceiptStylePanel,
  SermonHeader,
  TextColorSelector,
  SermonContent,
  useSermonHighlighting,
  useSermonNavigation,
  ChromeStyleSearch,
} from "@/components/SermonReader";

// Local interface for sermon paragraphs
interface SermonParagraphData {
  id: number;
  content: string;
  originalIndex: number;
}

const SelectedSermon = ({
  background,
  setBackground,
}: {
  background: boolean;
  setBackground: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    selectedMessage,
    settings,
    setRecentSermons,
    isBookmarked,
    toggleBookmark,
    pendingSearchNav,
    setPendingSearchNav,
  } = useSermonContext();

  const { isDarkMode } = useTheme();

  const [showControlPanel, setShowControlPanel] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<number>(
    Number(selectedMessage?.lastRead) || 0
  );
  const [sermonTColor, setSermonTColor] = useState("#f8d9c4");
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to split sermon into paragraphs using mobile app's logic
  const sermonParagraphs = useMemo((): SermonParagraphData[] => {
    if (!selectedMessage?.sermon) return [];

    // Use the same formatting logic as mobile app
    const formattedParagraphs = formatSermonIntoParagraphs(
      selectedMessage.sermon
    );

    // Convert to SermonParagraph format for compatibility
    return formattedParagraphs.map((content, index) => ({
      id: index + 1,
      content: content,
      originalIndex: index,
    }));
  }, [selectedMessage?.sermon]);

  // Use custom hooks for highlighting and navigation
  const {
    selectionRange,
    showColorPalette,
    palettePosition,
    highlights,
    highlightColors,
    handleTextSelection,
    applyHighlight,
    setHighlights,
  } = useSermonHighlighting(sermonParagraphs, scrollContainerRef);

  const {
    currentParagraph,
    searchQuery,
    searchResultsCount,
    currentSearchIndex,
    handleSearch,
    goToNextSearchResult,
    goToPreviousSearchResult,
    goToParagraph,
    goToPreviousParagraph,
    goToNextParagraph,
    setSearchQuery,
    isSearchVisible,
    setIsSearchVisible,
    showSearch,
    hideSearch,
  } = useSermonNavigation(sermonParagraphs, scrollContainerRef);

  // Legacy search results format for compatibility
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const paragraphTexts = sermonParagraphs.map((p) => p.content);
    const resultIndices = searchSermon(paragraphTexts, searchQuery);

    return resultIndices.map((index) => ({
      paragraphId: index + 1,
      matches: 1,
    }));
  }, [sermonParagraphs, searchQuery]);

  // Handle search navigation for legacy compatibility
  const handleNavigateSearch = (direction: "next" | "prev") => {
    if (direction === "next") {
      goToNextSearchResult();
    } else {
      goToPreviousSearchResult();
    }
  };

  // Jump to specific paragraph (legacy compatibility)
  const jumpToParagraph = (paragraphId: number) => {
    goToParagraph(paragraphId);
  };

  // For very large sermons, we could use the async version
  // This is kept for future optimization if needed
  const processLargeSermonAsync = useCallback(async () => {
    if (!selectedMessage?.sermon) return [];

    try {
      const formattedParagraphs = await formatSermonIntoParagraphsAsync(
        selectedMessage.sermon
      );

      return formattedParagraphs.map((content, index) => ({
        id: index + 1,
        content: content,
        originalIndex: index,
      }));
    } catch (error) {
      console.error("Error processing large sermon:", error);
      // Fallback to synchronous processing
      return formatSermonIntoParagraphs(selectedMessage.sermon).map(
        (content, index) => ({
          id: index + 1,
          content: content,
          originalIndex: index,
        })
      );
    }
  }, [selectedMessage?.sermon]);

  const highlightEndnotesAndQuotes = (text: string) => {
    // Enhanced regex to capture quotes from "Endnote" to "William Marrion Branham" (case insensitive)
    const quoteRegex = /Endnote(.*?)William\s+Marrion\s+Branham/gis;
    const simpleEndnoteRegex = /Endnote/gi;

    // Find all quote matches first
    const quoteMatches = Array.from(text.matchAll(quoteRegex));

    if (quoteMatches.length === 0) {
      // No quotes found, just highlight simple "Endnote" occurrences and numbers
      return highlightNumbersAndEndnotes(text);
    }

    // Process text with quotes
    let processedText: React.ReactNode[] = [];
    let lastIndex = 0;

    quoteMatches.forEach((match, matchIndex) => {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      // Add text before the quote (with number highlighting)
      if (matchStart > lastIndex) {
        const beforeText = text.slice(lastIndex, matchStart);
        processedText.push(
          <span key={`before-${matchIndex}`}>
            {highlightNumbersAndEndnotes(beforeText)}
          </span>
        );
      }

      // Add the quote with special highlighting
      const fullQuote = match[0];
      const quoteContent = match[1]; // Content between "Endnote" and "William Marrion Branham"

      processedText.push(
        <span key={`quote-${matchIndex}`}>
          {/* Endnote marker */}
          <span
            className="font-semibold italic"
            style={{
              color: isDarkMode ? "#fbbf24" : "#d97706",
            }}
            title="William Branham quote marker"
          >
            Endnote
          </span>
          {/* Quote content */}
          <span
            className="italic font-medium"
            style={{
              color: isDarkMode ? "#a78bfa" : "#7c3aed",
              marginLeft: "2px",
              marginRight: "2px",
            }}
            title="William Branham quote"
          >
            {quoteContent}
          </span>
          {/* Author name */}
          <span
            className="font-bold"
            style={{
              color: isDarkMode ? "#f59e0b" : "#b45309",
            }}
            title="Quote author"
          >
            William Marrion Branham
          </span>
        </span>
      );

      lastIndex = matchEnd;
    });

    // Add remaining text after the last quote (with number highlighting)
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      processedText.push(
        <span key="remaining">
          {highlightNumbersAndEndnotes(remainingText)}
        </span>
      );
    }

    return <span>{processedText}</span>;
  };

  // Helper function to highlight numbers and standalone endnotes
  const highlightNumbersAndEndnotes = (text: string) => {
    const simpleEndnoteRegex = /Endnote/gi;

    // First handle endnotes
    const endnoteParts = text.split(simpleEndnoteRegex);

    return (
      <span>
        {endnoteParts.map((part, i, arr) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span
                className="font-semibold italic"
                style={{
                  color: isDarkMode ? "#fbbf24" : "#d97706",
                }}
                title="William Branham quote marker"
              >
                Endnote
              </span>
            )}
            {highlightNumbers(part)}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Function to highlight numbers in text
  const highlightNumbers = (text: string) => {
    // Regex to match numbers (including decimals, ranges, and common number formats)
    const numberRegex =
      /\b\d+(?:[.,]\d+)*(?:\s*-\s*\d+(?:[.,]\d+)*)?(?:st|nd|rd|th)?\b/g;

    const parts = text.split(numberRegex);
    const numbers = text.match(numberRegex) || [];

    if (numbers.length === 0) {
      return text;
    }

    return (
      <span>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < numbers.length && (
              <span
                className="font-medium"
                style={{
                  color: isDarkMode ? "#ac7850" : "#6a4626",
                  fontWeight: "600",
                }}
                title="Number"
              >
                {numbers[i]}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Track scroll position for saving progress
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setScrollPosition(scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Save progress
  useEffect(() => {
    if (!selectedMessage?.id) return;

    const saveScrollPosition = () => {
      const recentSermons = JSON.parse(
        localStorage.getItem("recentSermons") || "[]"
      );
      const currentSermonIndex = recentSermons.findIndex(
        (sermon: Sermon) => sermon.id === (selectedMessage.id as any)
      );

      if (currentSermonIndex !== -1) {
        const updatedSermons = [...recentSermons];
        updatedSermons[currentSermonIndex] = {
          ...selectedMessage,
          lastRead: scrollPosition,
          lastParagraph: currentParagraph,
        };
        localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
        setRecentSermons(updatedSermons);
      }
    };

    const interval = setInterval(saveScrollPosition, 5000); // Auto-save every 5 seconds
    return () => {
      clearInterval(interval);
      saveScrollPosition(); // Save on unmount
    };
  }, [selectedMessage, scrollPosition, currentParagraph, setRecentSermons]);

  useEffect(() => {
    setSermonTColor(isDarkMode ? "#f4d1b9" : "#efcda2");
  }, [isDarkMode]);

  // Handle pending search navigation
  useEffect(() => {
    if (
      pendingSearchNav &&
      selectedMessage?.id === pendingSearchNav.targetSermonId
    ) {
      // Set the search query for highlighting
      setSearchQuery(pendingSearchNav.searchTerm);

      // Wait for paragraphs to render then navigate
      const timer = setTimeout(() => {
        jumpToParagraph(pendingSearchNav.targetParagraphId);
        // Clear the pending navigation
        setPendingSearchNav(null);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [
    pendingSearchNav,
    selectedMessage,
    setPendingSearchNav,
    setSearchQuery,
    jumpToParagraph,
  ]);

  const handleManualSave = () => {
    if (!selectedMessage?.id) return;

    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]"
    );
    const currentSermonIndex = recentSermons.findIndex(
      (sermon: Sermon) => sermon.id === (selectedMessage.id as any)
    );

    if (currentSermonIndex !== -1) {
      const updatedSermons = [...recentSermons];
      updatedSermons[currentSermonIndex] = {
        ...selectedMessage,
        lastRead: scrollPosition,
        lastParagraph: currentParagraph,
      };
      localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
      setRecentSermons(updatedSermons);
    }
    setShowSaveNotification(true);
  };

  return (
    <div className="bg-white dark:bg-background h-screen   relative  w-screen">
      <SaveNotification
        show={showSaveNotification}
        onClose={() => setShowSaveNotification(false)}
      />

      {/* Floating Control Button */}
      {selectedMessage?.type === "text" && (
        <FloatingControlButton
          showControlPanel={showControlPanel}
          onToggle={() => setShowControlPanel(!showControlPanel)}
          isVisible={true}
        />
      )}

      {/* Receipt Style Control Panel */}
      <ReceiptStylePanel
        show={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        sermon={selectedMessage}
        onSearch={handleSearch}
        searchResults={searchResults}
        currentMatch={currentSearchIndex}
        onNavigateSearch={handleNavigateSearch}
        currentParagraph={currentParagraph}
        onJumpToParagraph={jumpToParagraph}
      />

      {/* Color Palette for Text Highlighting */}
      <ColorPalette
        showColorPalette={showColorPalette}
        selectionRange={selectionRange}
        palettePosition={palettePosition}
        highlightColors={highlightColors}
        highlights={highlights}
        onApplyHighlight={applyHighlight}
      />

      {/* Chrome-Style Search Bar */}
      <ChromeStyleSearch
        isVisible={isSearchVisible}
        onClose={hideSearch}
        onSearch={handleSearch}
        searchResultsCount={searchResultsCount}
        currentSearchIndex={currentSearchIndex}
        onNavigateNext={goToNextSearchResult}
        onNavigatePrevious={goToPreviousSearchResult}
      />

      <div className="bg-center flex flex-col pb-10">
        <div className="mb-5 h-full">
          <div
            className="rounded-lg px-4 h-[100vh] overflow-y-scroll overflow-x-hidden no-scrollbar text-wrap max-w-full"
            ref={scrollContainerRef}
            style={{
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
            // style={{
            //   scrollbarWidth: "thin",
            //   scrollbarColor: !isDarkMode
            //     ? "#c0c0c0 #f3f4f6"
            //     : "#422e22 #202020",
            // }}
          >
            {selectedMessage?.type === "text" ? (
              <div className="mx-auto px-12 max-w-full">
                {/* Text Color Selector */}
                <TextColorSelector onColorChange={setSermonTColor} />

                {/* Sermon Header */}
                <SermonHeader title={selectedMessage?.title || ""} />

                {/* Sermon Content with Paragraphs */}
                <div
                  className="space-y-6 relative max-w-full"
                  style={{ overflowX: "hidden" }}
                >
                  {sermonParagraphs.map((paragraph) => (
                    <div
                      key={paragraph.id}
                      id={`paragraph-${paragraph.id}`}
                      className="relative group bg-transparent"
                    >
                      {/* Bookmark Button - Shows on hover */}
                      <button
                        onClick={() => {
                          if (selectedMessage) {
                            toggleBookmark(
                              selectedMessage.id as any,
                              selectedMessage.title,
                              paragraph.id,
                              paragraph.content,
                              selectedMessage.location,
                              selectedMessage.year?.toString()
                            );
                          }
                        }}
                        className={`absolute right-0 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10 ${
                          selectedMessage &&
                          isBookmarked(selectedMessage.id as any, paragraph.id)
                            ? isDarkMode
                              ? "bg-yellow-600 hover:bg-yellow-500 text-yellow-100"
                              : "bg-yellow-500 hover:bg-yellow-400 text-white"
                            : isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                        } shadow-lg border-2 ${
                          selectedMessage &&
                          isBookmarked(selectedMessage.id as any, paragraph.id)
                            ? "border-yellow-400"
                            : isDarkMode
                            ? "border-gray-600"
                            : "border-gray-300"
                        }`}
                        title={
                          selectedMessage &&
                          isBookmarked(selectedMessage.id as any, paragraph.id)
                            ? "Remove bookmark"
                            : "Add bookmark"
                        }
                      >
                        {selectedMessage &&
                        isBookmarked(
                          selectedMessage.id as any,
                          paragraph.id
                        ) ? (
                          <BookmarkCheck size={14} />
                        ) : (
                          <Bookmark size={14} />
                        )}
                      </button>

                      {/* Paragraph Content with inline number */}
                      <div
                        className={`leading-relaxed bg-transparent text-stone-600 dark:text-accent text-wrap break-words justify-center text-center py-2 rounded-r-lg transition-all duration-200 max-w-full overflow-hidden ${
                          currentParagraph === paragraph.id
                            ? isDarkMode
                              ? "bg-primary dark:bg-transparent border-l-4 border-blue-500"
                              : "bg-blue-50 border-l-4 border-blue-500"
                            : "border-l-4 border-transparent"
                        }`}
                        style={{
                          fontFamily: settings.fontFamily || "Zilla Slab",
                          fontWeight: settings.fontWeight,
                          fontSize: `${settings.fontSize}px`,
                          fontStyle: settings.fontStyle,
                          color: isDarkMode ? sermonTColor : "#000000",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          hyphens: "auto",
                        }}
                        onMouseUp={handleTextSelection}
                      >
                        {/* Inline paragraph number */}
                        <span
                          className={`font-archivo font-bold mr-2 ${
                            currentParagraph === paragraph.id
                              ? isDarkMode
                                ? "text-[#d57a3e]"
                                : "text-[#4b2a14]"
                              : isDarkMode
                              ? "text-[#eba373]"
                              : "text-[#4b2a14]"
                          } transition-colors duration-200`}
                          style={{
                            fontSize: `${Math.max(
                              Number(settings.fontSize) * 0.8,
                              14
                            )}px`,
                          }}
                        >
                          {paragraph.id}.
                        </span>
                        {highlightEndnotesAndQuotes(paragraph.content)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DownloadSermon />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedSermon;
