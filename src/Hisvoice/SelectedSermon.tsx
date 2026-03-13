import * as React from "react";
import {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Card, Button, theme } from "antd";
import ModernAudioPlayer from "./ModernAudioPlayer";
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
  useSermonHighlighting,
  useSermonNavigation,
  ChromeStyleSearch,
  EndnoteSheet,
} from "@/components/SermonReader";
import { parseEndnote, type EndnoteData } from "@/utils/endnoteParser";

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
    isPresentationMode,
  } = useSermonContext();

  const { isDarkMode, accentColor } = useTheme();

  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [endnoteSheetData, setEndnoteSheetData] = useState<EndnoteData | null>(
    null,
  );
  const [showEndnoteSheet, setShowEndnoteSheet] = useState(false);
  const [searchMatchHighlight, setSearchMatchHighlight] = useState<{
    paragraphId: number;
    searchTerm: string;
  } | null>(null);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [canSaveProgress, setCanSaveProgress] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to split sermon into paragraphs using mobile app's logic
  const sermonParagraphs = useMemo((): SermonParagraphData[] => {
    if (!selectedMessage?.sermon) return [];

    // Use the same formatting logic as mobile app
    const formattedParagraphs = formatSermonIntoParagraphs(
      selectedMessage.sermon,
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
    removeHighlight,
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
        selectedMessage.sermon,
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
        }),
      );
    }
  }, [selectedMessage?.sermon]);

  // Function to apply user highlights to text
  const applyUserHighlights = (text: string, paragraphId: number) => {
    const paragraphHighlights = highlights[paragraphId];
    if (!paragraphHighlights || Object.keys(paragraphHighlights).length === 0) {
      return text;
    }

    // Sort highlights by start offset to apply them in order
    const sortedHighlights = Object.values(paragraphHighlights).sort(
      (a, b) => a.startOffset - b.startOffset,
    );

    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.startOffset > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, highlight.startOffset)}
          </span>,
        );
      }

      // Add highlighted text
      result.push(
        <span
          key={`highlight-${index}`}
          style={{
            backgroundColor: highlight.color,
            padding: "2px 4px",
            borderRadius: "3px",
            transition: "all 0.2s ease",
          }}
        >
          {text.substring(highlight.startOffset, highlight.endOffset)}
        </span>,
      );

      lastIndex = highlight.endOffset;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return <>{result}</>;
  };

  const highlightEndnotesAndQuotes = (
    text: string,
    paragraphId?: number,
    onEndnoteClick?: () => void,
  ) => {
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
          </span>,
        );
      }

      // Add the quote with special highlighting
      const fullQuote = match[0];
      const quoteContent = match[1]; // Content between "Endnote" and "William Marrion Branham"

      processedText.push(
        <span
          key={`quote-${matchIndex}`}
          onClick={onEndnoteClick}
          className={
            onEndnoteClick
              ? "cursor-pointer hover:opacity-75 transition-opacity duration-150"
              : ""
          }
          title={onEndnoteClick ? "Click to view source quote" : undefined}
        >
          {/* Endnote marker */}
          <span
            className="font-semibold italic"
            style={{ color: accentColor + "90" }}
            title="William Branham quote marker"
          >
            Endnote
          </span>
          {/* Quote content */}
          <span
            className="italic font-medium"
            style={{
              color: accentColor + "80",
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
            style={{ color: accentColor + "90" }}
            title="Quote author"
          >
            William Marrion Branham
          </span>
        </span>,
      );

      lastIndex = matchEnd;
    });

    // Add remaining text after the last quote (with number highlighting)
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      processedText.push(
        <span key="remaining">
          {highlightNumbersAndEndnotes(remainingText)}
        </span>,
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
                style={{ color: accentColor }}
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

  // Reset restoration flag and clear state when sermon changes
  useEffect(() => {
    setHasRestoredPosition(false);
    setCanSaveProgress(false);
    // Clear highlights from previous sermon
    setHighlights({});
    // Clear search query
    setSearchQuery("");
    // Clear search match highlight
    setSearchMatchHighlight(null);

    // Save last read sermon to localStorage
    if (selectedMessage) {
      localStorage.setItem("lastReadSermon", JSON.stringify(selectedMessage));

      // Update recent sermons when a sermon is opened
      const existingRecent = JSON.parse(
        localStorage.getItem("recentSermons") || "[]",
      );

      // Remove if already exists
      const filteredRecent = existingRecent.filter(
        (item: Sermon) => item.id !== selectedMessage.id,
      );
      // Add to front
      filteredRecent.unshift(selectedMessage);

      // Keep only last 4 sermons
      const limitedRecent = filteredRecent.slice(0, 4);

      // Save to localStorage
      localStorage.setItem("recentSermons", JSON.stringify(limitedRecent));
      setRecentSermons(limitedRecent);
    }
  }, [selectedMessage, setHighlights, setSearchQuery, setRecentSermons]);

  // Restore last read paragraph when sermon loads (only once, not for search navigation)
  useEffect(() => {
    if (!selectedMessage?.id || hasRestoredPosition || pendingSearchNav) return;

    // Check if this sermon has a saved last read paragraph
    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]",
    );
    const savedSermon = recentSermons.find(
      (s: Sermon) => s.id === selectedMessage.id,
    );

    // Only restore if this sermon exists in recentSermons AND has a valid lastParagraph > 0
    if (
      savedSermon?.lastParagraph &&
      savedSermon.lastParagraph > 0 &&
      sermonParagraphs.length > 0
    ) {
      // Wait for paragraphs to render, then restore position
      const timer = setTimeout(() => {
        goToParagraph(savedSermon.lastParagraph);
        setHasRestoredPosition(true);
        // Enable saving after restoration plus a 2-second buffer
        setTimeout(() => setCanSaveProgress(true), 2000);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      // For first-time sermons or those without saved position, just mark as restored
      // This will start at the beginning (paragraph 1 becomes visible)
      setHasRestoredPosition(true);
      // Enable saving after 2-second buffer for new sermons
      const timer = setTimeout(() => setCanSaveProgress(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [
    selectedMessage?.id,
    hasRestoredPosition,
    pendingSearchNav,
    sermonParagraphs.length,
    goToParagraph,
  ]);

  // Save progress - track last read paragraph
  useEffect(() => {
    // Only save if we have a valid paragraph (> 0) and sermon, restoration is complete, and enough time has passed
    if (
      !selectedMessage?.id ||
      currentParagraph === 0 ||
      !hasRestoredPosition ||
      !canSaveProgress
    )
      return;

    const saveLastParagraph = () => {
      const recentSermons = JSON.parse(
        localStorage.getItem("recentSermons") || "[]",
      );
      const currentSermonIndex = recentSermons.findIndex(
        (sermon: Sermon) => sermon.id === (selectedMessage.id as any),
      );

      if (currentSermonIndex !== -1) {
        const updatedSermons = [...recentSermons];
        updatedSermons[currentSermonIndex] = {
          ...selectedMessage,
          lastParagraph: currentParagraph,
        };
        localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
        setRecentSermons(updatedSermons);
      }
    };

    const interval = setInterval(saveLastParagraph, 3000); // Auto-save every 3 seconds
    return () => {
      clearInterval(interval);
      saveLastParagraph(); // Save on unmount
    };
  }, [selectedMessage, currentParagraph, setRecentSermons]);

  // Reset restoration flag when sermon changes
  useEffect(() => {
    setHasRestoredPosition(false);
  }, [selectedMessage?.id]);

  // Handle pending search navigation
  useEffect(() => {
    if (
      pendingSearchNav &&
      selectedMessage?.id === pendingSearchNav.targetSermonId
    ) {
      // Set the search query for highlighting
      setSearchQuery(pendingSearchNav.searchTerm);

      // Set search match highlight for visual distinction
      setSearchMatchHighlight({
        paragraphId: pendingSearchNav.targetParagraphId,
        searchTerm: pendingSearchNav.searchTerm,
      });

      // Wait for paragraphs to render and layout transitions to complete, then navigate
      const timer = setTimeout(() => {
        goToParagraph(pendingSearchNav.targetParagraphId);
        // Clear the pending navigation
        setPendingSearchNav(null);
      }, 500);

      // Auto-clear the search match highlight after 4 seconds
      const clearTimer = setTimeout(() => {
        setSearchMatchHighlight(null);
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [
    pendingSearchNav,
    selectedMessage,
    setPendingSearchNav,
    setSearchQuery,
    goToParagraph,
  ]);

  // Re-scroll to current paragraph when presentation mode changes
  useEffect(() => {
    if (currentParagraph > 0) {
      // Wait for layout transition to complete (300ms animation + 200ms buffer)
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        const scrollParent = container?.parentElement;

        if (scrollParent) {
          // First try to find and scroll to the highlighted search match if it exists
          if (
            searchMatchHighlight &&
            searchMatchHighlight.paragraphId === currentParagraph
          ) {
            const paragraph = document.getElementById(
              `paragraph-${currentParagraph}`,
            );
            const highlightSpan = paragraph?.querySelector(".animate-pulse");

            if (highlightSpan) {
              const containerRect = scrollParent.getBoundingClientRect();
              const elementRect = highlightSpan.getBoundingClientRect();

              const scrollTop = scrollParent.scrollTop;
              const elementRelativeTop = elementRect.top - containerRect.top;
              const centerOffset =
                (containerRect.height - elementRect.height) / 2;
              const targetScroll =
                scrollTop + elementRelativeTop - centerOffset;

              scrollParent.scrollTo({
                top: targetScroll,
                behavior: "smooth",
              });
              return;
            }
          }

          // Fallback to scrolling to the paragraph
          goToParagraph(currentParagraph);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    isPresentationMode,
    currentParagraph,
    goToParagraph,
    searchMatchHighlight,
    scrollContainerRef,
  ]);

  const handleEndnoteClick = (paragraphText: string) => {
    const data = parseEndnote(paragraphText);
    if (!data) return;
    setEndnoteSheetData(data);
    setShowEndnoteSheet(true);
  };

  const handleManualSave = () => {
    if (!selectedMessage?.id) return;

    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]",
    );
    const currentSermonIndex = recentSermons.findIndex(
      (sermon: Sermon) => sermon.id === (selectedMessage.id as any),
    );

    if (currentSermonIndex !== -1) {
      const updatedSermons = [...recentSermons];
      updatedSermons[currentSermonIndex] = {
        ...selectedMessage,
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

      {/* Endnote Reference Sheet */}
      <EndnoteSheet
        endnoteData={endnoteSheetData}
        isOpen={showEndnoteSheet}
        onClose={() => setShowEndnoteSheet(false)}
      />

      <div className="h-full flex flex-col overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="w-full px-2 py-2" ref={scrollContainerRef}>
            {selectedMessage?.type === "text" ? (
              <div
                key={`sermon-${selectedMessage.id}`}
                className="w-full"
                style={{ maxWidth: "100%", overflowWrap: "break-word" }}
              >
                {/* Sermon Header */}
                <SermonHeader title={selectedMessage?.title || ""} />

                {/* Sermon Content with Paragraphs */}
                <div
                  className="space-y- mt-3"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  {sermonParagraphs.length === 0 && !selectedMessage?.sermon ? (
                    /* Loading skeleton while sermon text is being fetched */
                    <div className="px-6 py-4 space-y-5 animate-pulse">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div
                            className="flex-shrink-0 w-8 h-4 rounded"
                            style={{
                              backgroundColor: isDarkMode
                                ? "rgba(120,113,108,.25)"
                                : "rgba(214,211,209,.6)",
                            }}
                          />
                          <div className="flex-1 space-y-2">
                            <div
                              className="h-4 rounded"
                              style={{
                                width: `${70 + Math.random() * 30}%`,
                                backgroundColor: isDarkMode
                                  ? "rgba(120,113,108,.18)"
                                  : "rgba(214,211,209,.5)",
                              }}
                            />
                            {i % 3 !== 2 && (
                              <div
                                className="h-4 rounded"
                                style={{
                                  width: `${40 + Math.random() * 40}%`,
                                  backgroundColor: isDarkMode
                                    ? "rgba(120,113,108,.12)"
                                    : "rgba(214,211,209,.35)",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    sermonParagraphs.map((paragraph) => (
                      <div
                        key={paragraph.id}
                        id={`paragraph-${paragraph.id}`}
                        className="relative group"
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
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
                                selectedMessage.year?.toString(),
                              );
                            }
                          }}
                          className={`absolute right-0 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10 ${
                            selectedMessage &&
                            isBookmarked(
                              selectedMessage.id as any,
                              paragraph.id,
                            )
                              ? "text-white"
                              : isDarkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                          } shadow-lg border-2 ${
                            selectedMessage &&
                            isBookmarked(
                              selectedMessage.id as any,
                              paragraph.id,
                            )
                              ? "border-transparent"
                              : isDarkMode
                                ? "border-gray-600"
                                : "border-gray-300"
                          }`}
                          style={
                            selectedMessage &&
                            isBookmarked(
                              selectedMessage.id as any,
                              paragraph.id,
                            )
                              ? {
                                  backgroundColor: accentColor,
                                  borderColor: accentColor,
                                }
                              : undefined
                          }
                          title={
                            selectedMessage &&
                            isBookmarked(
                              selectedMessage.id as any,
                              paragraph.id,
                            )
                              ? "Remove bookmark"
                              : "Add bookmark"
                          }
                        >
                          {selectedMessage &&
                          isBookmarked(
                            selectedMessage.id as any,
                            paragraph.id,
                          ) ? (
                            <BookmarkCheck size={14} />
                          ) : (
                            <Bookmark size={14} />
                          )}
                        </button>

                        {/* Paragraph Content with inline number */}
                        <div
                          className="leading-normal  px-6  rounded-lg transition-all duration-200 border-l-4"
                          style={{
                            fontFamily: settings.fontFamily || "Zilla Slab",
                            fontWeight: settings.fontWeight,
                            fontSize: isPresentationMode
                              ? `${settings.fontSize}px`
                              : "16px",
                            fontStyle: settings.fontStyle,
                            color: isDarkMode ? "#d6d3d1" : "#000000",
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            width: "100%",
                            maxWidth: "100%",
                            overflow: "hidden",
                            boxSizing: "border-box",
                            borderLeftColor:
                              currentParagraph === paragraph.id
                                ? accentColor
                                : "transparent",
                            backgroundColor:
                              currentParagraph === paragraph.id
                                ? accentColor + "15"
                                : undefined,
                          }}
                          onMouseUp={handleTextSelection}
                        >
                          {/* Inline paragraph number */}
                          <span
                            className="font-archivo font-bold mr-2 transition-colors duration-200"
                            style={{
                              fontSize: isPresentationMode
                                ? `${Math.max(Number(settings.fontSize) * 0.8, 14)}px`
                                : "14px",
                              color:
                                currentParagraph === paragraph.id
                                  ? accentColor
                                  : isDarkMode
                                    ? "#78716c"
                                    : "#57534e",
                            }}
                          >
                            {paragraph.id}.
                          </span>
                          {/* Apply user highlights first, then endnotes/quotes */}
                          <span>
                            {(() => {
                              // Helper to apply search match highlight to plain text
                              const applySearchMatchHighlight = (
                                text: string,
                              ) => {
                                if (
                                  !searchMatchHighlight ||
                                  searchMatchHighlight.paragraphId !==
                                    paragraph.id
                                ) {
                                  return highlightEndnotesAndQuotes(
                                    text,
                                    paragraph.id,
                                    () => handleEndnoteClick(paragraph.content),
                                  );
                                }

                                const searchTerm =
                                  searchMatchHighlight.searchTerm.trim();
                                const lowerText = text.toLowerCase();
                                const lowerTerm = searchTerm.toLowerCase();
                                const matchIndex = lowerText.indexOf(lowerTerm);

                                if (matchIndex === -1) {
                                  return highlightEndnotesAndQuotes(
                                    text,
                                    paragraph.id,
                                    () => handleEndnoteClick(paragraph.content),
                                  );
                                }

                                // Split text into before, match, and after
                                const beforeMatch = text.substring(
                                  0,
                                  matchIndex,
                                );
                                const matchText = text.substring(
                                  matchIndex,
                                  matchIndex + searchTerm.length,
                                );
                                const afterMatch = text.substring(
                                  matchIndex + searchTerm.length,
                                );

                                return (
                                  <>
                                    {highlightEndnotesAndQuotes(
                                      beforeMatch,
                                      paragraph.id,
                                      () =>
                                        handleEndnoteClick(paragraph.content),
                                    )}
                                    <span
                                      className="animate-pulse"
                                      style={{
                                        backgroundColor: accentColor + "35",
                                        color: accentColor,
                                        padding: "2px 4px",
                                        borderRadius: "4px",
                                        fontWeight: "700",
                                      }}
                                    >
                                      {matchText}
                                    </span>
                                    {highlightEndnotesAndQuotes(
                                      afterMatch,
                                      paragraph.id,
                                      () =>
                                        handleEndnoteClick(paragraph.content),
                                    )}
                                  </>
                                );
                              };

                              const paragraphHighlights =
                                highlights[paragraph.id];
                              if (
                                !paragraphHighlights ||
                                Object.keys(paragraphHighlights).length === 0
                              ) {
                                // No user highlights, apply search match if exists
                                return applySearchMatchHighlight(
                                  paragraph.content,
                                );
                              }

                              // If there are highlights, we need to apply them to the content
                              const sortedHighlights = Object.values(
                                paragraphHighlights,
                              ).sort((a, b) => a.startOffset - b.startOffset);

                              let parts: React.ReactNode[] = [];
                              let lastIndex = 0;

                              sortedHighlights.forEach((highlight, index) => {
                                // Add text before highlight
                                if (highlight.startOffset > lastIndex) {
                                  parts.push(
                                    <span key={`before-${index}`}>
                                      {highlightEndnotesAndQuotes(
                                        paragraph.content.substring(
                                          lastIndex,
                                          highlight.startOffset,
                                        ),
                                        paragraph.id,
                                        () =>
                                          handleEndnoteClick(paragraph.content),
                                      )}
                                    </span>,
                                  );
                                }

                                // Add highlighted text
                                parts.push(
                                  <span
                                    key={`highlight-${index}`}
                                    className={`cursor-pointer hover:opacity-80 ${isDarkMode ? "text-stone-900" : ""}`}
                                    style={{
                                      backgroundColor: highlight.color,
                                      padding: "2px 4px",
                                      borderRadius: "4px",
                                      transition: "all 0.2s ease",
                                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const highlightKey = `${highlight.startOffset}-${highlight.endOffset}`;
                                      removeHighlight(
                                        paragraph.id,
                                        highlightKey,
                                      );
                                    }}
                                    title="Click to remove highlight"
                                  >
                                    {paragraph.content.substring(
                                      highlight.startOffset,
                                      highlight.endOffset,
                                    )}
                                  </span>,
                                );

                                lastIndex = highlight.endOffset;
                              });

                              // Add remaining text
                              if (lastIndex < paragraph.content.length) {
                                parts.push(
                                  <span key="after">
                                    {highlightEndnotesAndQuotes(
                                      paragraph.content.substring(lastIndex),
                                      paragraph.id,
                                      () =>
                                        handleEndnoteClick(paragraph.content),
                                    )}
                                  </span>,
                                );
                              }

                              return <>{parts}</>;
                            })()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <ModernAudioPlayer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedSermon;
