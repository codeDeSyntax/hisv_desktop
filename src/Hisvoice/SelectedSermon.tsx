import * as React from "react";
import {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import ModernAudioPlayer from "./ModernAudioPlayer";
import { BookmarkCheck, Bookmark } from "lucide-react";

import { Sermon } from "@/types";
import { useSermonContext } from "@/Provider/Vsermons";

import { useTheme } from "@/Provider/Theme";
import {
  formatSermonIntoParagraphs,
  formatSermonIntoParagraphsAsync,
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
    setSettings,
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
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [canSaveProgress, setCanSaveProgress] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousSermonIdRef = useRef<string | number | undefined>(
    selectedMessage?.id,
  );
  const currentParagraphRef = useRef(0);
  const searchQueryRef = useRef("");

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
    selectionOverlayRects,
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
  } = useSermonNavigation(
    sermonParagraphs,
    scrollContainerRef,
    selectedMessage?.id,
  );

  const skeletonBaseColor = isDarkMode
    ? "rgba(120,113,108,.22)"
    : "rgba(214,211,209,.62)";
  const skeletonSoftColor = isDarkMode
    ? "rgba(120,113,108,.16)"
    : "rgba(214,211,209,.44)";
  const skeletonFaintColor = isDarkMode
    ? "rgba(120,113,108,.11)"
    : "rgba(214,211,209,.3)";

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
    // Handles: Endnote, Endnote:, Endnote :, Endnote #1, etc.
    const quoteRegex = /Endnote\s*:?(.*?)William\s+(?:Marrion\s+)?Branham/gis;

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
      const fullMatch = match[0];
      const quoteContent = match[1]; // Content between "Endnote[:]" and "William [Marrion] Branham"
      const normalizedQuoteContent = quoteContent.replace(/\s+/g, " ").trim();
      // Extract the "Endnote" prefix (with optional colon) and author name from the actual text
      const endnotePrefix = fullMatch.match(/^Endnote\s*:?/i)?.[0] || "Endnote";
      const authorName =
        fullMatch.match(/William\s+(?:Marrion\s+)?Branham/i)?.[0] ||
        "William Branham";

      processedText.push(
        <span
          key={`quote-${matchIndex}`}
          onClick={onEndnoteClick}
          className={
            onEndnoteClick
              ? "inline  leading-snug cursor-pointer  hover:opacity-75 transition-opacity duration-150"
              : "inline  leading-snug"
          }
          title={onEndnoteClick ? "Click to view source quote" : undefined}
        >
          {onEndnoteClick && (
            <span
              className="inline-flex items-center mr-1 align-middle"
              style={{ color: accentColor + "95" }}
              title="Tap to open source quote"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isDarkMode ? "white" : "#2D2D2D"}
                className="rotate-90"
              >
                <path
                  d="M17.493,9.082L11,8V3c0-1.104-0.896-2-2-2S7,1.896,7,3v10.064l-0.186-0.186c-1.172-1.172-3.071-1.172-4.243,0 l-0.279,0.279c-0.391,0.391-0.391,1.024,0,1.414l5.641,5.641l0.141-0.141C8.682,20.643,9.494,21,10.395,21h7.335 c1.254,0,2.27-1.016,2.27-2.27v-6.689C20,10.574,18.94,9.323,17.493,9.082z"
                  opacity=".35"
                />
                <path d="M19.5,19c-0.386,0-11.614,0-12,0C6.672,19,6,19.672,6,20.5S6.672,22,7.5,22c0.386,0,11.614,0,12,0 c0.828,0,1.5-0.672,1.5-1.5S20.328,19,19.5,19z" />
              </svg>
            </span>
          )}
          {/* Endnote marker */}
          <span
            className="font-thin font-dscript italic text-black  dark:text-white dark:opacity-75"
            style={{ color: accentColor }}
            title="William Branham quote marker"
          >
            {endnotePrefix}
          </span>
          {/* Quote content */}
          <span
            className=" font-thin font-serif  italic text-black  dark:text-white dark:opacity-75"
            style={{
              backgroundColor: accentColor + "40",
              marginLeft: "2px",
              marginRight: "2px",
            }}
            title="William Branham quote"
          >
            {normalizedQuoteContent}
            {"  "}
          </span>
          {/* Author name */}
          <span
            className="font-bol font-dscript text-black   dark:text-white "
            style={{ color: accentColor }}
            title="Quote author"
          >
            {authorName}
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
  // Matches: Endnote, Endnote:, Endnote :, endnote:  (case insensitive, optional space+colon)
  const highlightNumbersAndEndnotes = (text: string) => {
    const simpleEndnoteRegex = /Endnote\s*:?/gi;

    // Split while keeping the matched delimiters
    const parts = text.split(simpleEndnoteRegex);
    const matches = Array.from(text.matchAll(simpleEndnoteRegex));

    return (
      <span>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && matches[i - 1] && (
              <span
                className="font-semibold italic"
                style={{ color: accentColor }}
                title="William Branham quote marker"
              >
                {matches[i - 1][0]}
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
                className="font-medium italic "
                style={{
                  color: isDarkMode ? "white" : "black",
                  fontWeight: "600",
                }}
                title="Number"
              >
                {numbers[i]}{" "}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Reset restoration/search state only when sermon ID actually changes.
  // This avoids clearing Chrome-search query when the same sermon remounts
  // during layout/view mode switches (e.g. normal -> presentation).
  useEffect(() => {
    const currentSermonId = selectedMessage?.id;
    const didSermonChange = previousSermonIdRef.current !== currentSermonId;
    previousSermonIdRef.current = currentSermonId;

    if (!didSermonChange) {
      return;
    }

    setHasRestoredPosition(false);
    setCanSaveProgress(false);
    // Clear highlights from previous sermon
    setHighlights({});
    // Handle search query: preserve it if navigating via search, clear otherwise
    if (pendingSearchNav?.searchTerm) {
      // Pre-populate with the search term to avoid the input appearing blank
      setSearchQuery(pendingSearchNav.searchTerm);
    } else if (!pendingSearchNav && !isSearchVisible) {
      // Only clear search if not navigating to search AND search bar is not visible
      // This prevents clearing the search after pendingSearchNav becomes null
      setSearchQuery("");
    }

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
  }, [
    selectedMessage?.id,
    selectedMessage,
    setHighlights,
    setSearchQuery,
    setRecentSermons,
    pendingSearchNav,
    isSearchVisible,
  ]);

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

  useEffect(() => {
    currentParagraphRef.current = currentParagraph;
  }, [currentParagraph]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Handle pending search navigation
  useEffect(() => {
    if (
      pendingSearchNav &&
      selectedMessage?.id === pendingSearchNav.targetSermonId &&
      sermonParagraphs.length > 0
    ) {
      // Use the DOM-based handleSearch to highlight ALL occurrences,
      // then show the search bar so the user can navigate between matches.
      const timer = setTimeout(() => {
        handleSearch(pendingSearchNav.searchTerm);
        setIsSearchVisible(true);
        // Clear the pending navigation
        setPendingSearchNav(null);
      }, 600);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [
    pendingSearchNav,
    selectedMessage,
    sermonParagraphs.length,
    setPendingSearchNav,
    handleSearch,
    setIsSearchVisible,
  ]);

  // Re-scroll only when view mode toggles.
  // Avoid forced scrolling while user is manually navigating/scrolling.
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasActiveSearch = searchQueryRef.current.trim().length > 0;
      if (hasActiveSearch) {
        // Keep user-controlled position during active search; restoration is
        // already handled in useSermonNavigation on remount.
        return;
      }

      const paragraphAtModeSwitch = currentParagraphRef.current;
      if (paragraphAtModeSwitch > 0) {
        goToParagraph(paragraphAtModeSwitch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPresentationMode, goToParagraph]);

  // Ctrl +/- to adjust font size in presentation mode
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleFontKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;

      const isPlus = e.key === "+" || e.key === "=";
      const isMinus = e.key === "-" || e.key === "_";
      const isZero = e.key === "0";

      if (!isPlus && !isMinus && !isZero) return;

      e.preventDefault();

      const current = Number(settings.fontSize) || 16;
      let next: number;

      if (isZero) {
        next = 16; // reset to default
      } else if (isPlus) {
        next = Math.min(current + 2, 120);
      } else {
        next = Math.max(current - 2, 12);
      }

      const updated = { ...settings, fontSize: next.toString() };
      setSettings(updated);
      localStorage.setItem("sermonSettings", JSON.stringify(updated));
    };

    document.addEventListener("keydown", handleFontKey);
    return () => document.removeEventListener("keydown", handleFontKey);
  }, [isPresentationMode, settings, setSettings]);

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
    <div className="bg-white dark:bg-background h-screen   relative  w-screen flex items-center justify-center">
      <SaveNotification
        show={showSaveNotification}
        onClose={() => setShowSaveNotification(false)}
      />

      {selectionOverlayRects.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-[55]">
          {selectionOverlayRects.map((rect) => (
            <div
              key={rect.id}
              className="absolute rounded-[3px]"
              style={{
                left: `${rect.x - 1}px`,
                top: `${rect.y - 1}px`,
                width: `${rect.width + 2}px`,
                height: `${rect.height + 2}px`,
                border: `2px solid ${accentColor}cc`,
                backgroundColor: "transparent",
                boxShadow: isDarkMode
                  ? `0 0 0 1px ${accentColor}55`
                  : `0 0 0 1px ${accentColor}44`,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Control Button */}
      {selectedMessage?.type === "text" && (
        <FloatingControlButton
          showControlPanel={showControlPanel}
          onToggle={() => setShowControlPanel(!showControlPanel)}
          isVisible={true}
        />
      )}

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
        externalQuery={searchQuery}
      />

      {/* Endnote Reference Sheet */}
      <EndnoteSheet
        endnoteData={endnoteSheetData}
        isOpen={showEndnoteSheet}
        onClose={() => setShowEndnoteSheet(false)}
      />

      <div className="relative h-full flex flex-col justify-start items-stretch overflow-hidden px-0 sm:px-1">
        {/* Receipt Style Control Panel */}
        <ReceiptStylePanel
          show={showControlPanel}
          onClose={() => setShowControlPanel(false)}
          sermon={selectedMessage}
        />

        {/* Scrollable Content Area */}
        <div
          className={`flex- w-full min-w-0   ${isPresentationMode ? "h-[95%]" : "h-[98%]"} overflow-y-auto overflow-x-hidden ${!isPresentationMode && "no-scrollbar"}`}
          style={{
            scrollBehavior: "smooth",
            scrollbarColor: isDarkMode
              ? `${accentColor}80 transparent`
              : `${accentColor}80 transparent`,
            scrollbarWidth: isPresentationMode ? "thin" : "none",
          }}
        >
          <div
            className="w-full min-w-0 px-0 sm:px-2"
            ref={scrollContainerRef}
            style={
              !isPresentationMode
                ? {
                    maxWidth: `${Number(settings.readingWidth) || 100}%`,
                    margin: "0 auto",
                    width: "100%",
                  }
                : undefined
            }
          >
            {selectedMessage?.type === "text" ? (
              <div
                key={`sermon-${selectedMessage.id}`}
                className="w-full min-w-0"
                style={{ maxWidth: "100%", overflowWrap: "break-word" }}
              >
                {/* Sermon Header */}
                <SermonHeader title={selectedMessage?.title || ""} />

                {/* Sermon Content with Paragraphs */}
                <div
                  className="space-y-4 mt-3 b no-scrollbar "
                  style={{
                    // width: "100%",
                    // maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  {sermonParagraphs.length === 0 && !selectedMessage?.sermon ? (
                    /* Loading skeleton while sermon text is being fetched */
                    <div className="w-full  px-3  py-5 sm:py-6 space-y-6 animate-pulse">
                      <div className="w-full  space-y-4 pb-5 border-b border-zinc-100/80 dark:border-zinc-800/70">
                        <div
                          className="h-6 w-full rounded-full"
                          style={{ backgroundColor: skeletonBaseColor }}
                        />
                        <div className="grid gap-2">
                          <div
                            className="h-4 w-[94%] rounded-full"
                            style={{ backgroundColor: skeletonSoftColor }}
                          />
                          <div
                            className="h-4 w-[82%] rounded-full"
                            style={{ backgroundColor: skeletonFaintColor }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <div
                            className="h-8 w-24 rounded-full"
                            style={{ backgroundColor: skeletonFaintColor }}
                          />
                          <div
                            className="h-8 w-28 rounded-full"
                            style={{ backgroundColor: skeletonFaintColor }}
                          />
                          <div
                            className="h-8 w-32 rounded-full"
                            style={{ backgroundColor: skeletonFaintColor }}
                          />
                          <div
                            className="h-8 w-20 rounded-full"
                            style={{ backgroundColor: skeletonFaintColor }}
                          />
                        </div>
                      </div>

                      <div className="w-full space-y-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-full space-y-3 rounded-3xl border border-zinc-100/70 dark:border-zinc-800/50 bg-zinc-50/70 dark:bg-zinc-900/30 px-4 py-4 sm:px-5"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div
                                className="h-3 w-full rounded-full"
                                style={{ backgroundColor: skeletonFaintColor }}
                              />
                              <div
                                className="h-3 w-[80%] rounded-full"
                                style={{ backgroundColor: skeletonFaintColor }}
                              />
                            </div>
                            <div
                              className="h-4 rounded-full"
                              style={{
                                width: `${96 - (i % 5) * 4}%`,
                                backgroundColor: skeletonBaseColor,
                              }}
                            />
                            <div
                              className="h-4 rounded-full"
                              style={{
                                width: `${84 - (i % 4) * 5}%`,
                                backgroundColor: skeletonSoftColor,
                              }}
                            />
                            {i % 3 !== 1 && (
                              <div
                                className="h-4 rounded-full"
                                style={{
                                  width: `${58 + (i % 3) * 10}%`,
                                  backgroundColor: skeletonFaintColor,
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
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
                        {/* Bookmark badge */}
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
                          className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-stone-300 dark:bg-stone-700 border px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-md transition-all duration-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:-translate-y-0.5 hover:scale-[1.02] ${
                            selectedMessage &&
                            isBookmarked(
                              selectedMessage.id as any,
                              paragraph.id,
                            )
                              ? "text-white dark:text-black"
                              : isDarkMode
                                ? "bg-zinc-800/90 hover:bg-zinc-700/95 text-zinc-200 border-zinc-700/80"
                                : "bg-white/90 hover:bg-white text-zinc-700 border-zinc-200/80"
                          } ${
                            selectedMessage &&
                            isBookmarked(
                              selectedMessage.id as any,
                              paragraph.id,
                            )
                              ? "border-transparent shadow-lg"
                              : isDarkMode
                                ? "border-zinc-700/80"
                                : "border-zinc-200/80"
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
                          aria-pressed={
                            !!(
                              selectedMessage &&
                              isBookmarked(
                                selectedMessage.id as any,
                                paragraph.id,
                              )
                            )
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
                            <>
                              <BookmarkCheck size={13} />
                              <span>BKD</span>
                            </>
                          ) : (
                            <>
                              <Bookmark size={13} />
                              <span>BK</span>
                            </>
                          )}
                        </button>

                        {/* Paragraph Content with inline number */}
                        <div
                          className="sermon-selection-scope leading-normal  px-6  rounded-lg transition-all duration-200 border-l-4"
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
                            lineHeight: 1.3,
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
                          <span data-paragraph-content="true">
                            {(() => {
                              const paragraphHighlights =
                                highlights[paragraph.id];
                              if (
                                !paragraphHighlights ||
                                Object.keys(paragraphHighlights).length === 0
                              ) {
                                // No user highlights, render with endnote/quote highlighting
                                return highlightEndnotesAndQuotes(
                                  paragraph.content,
                                  paragraph.id,
                                  () => handleEndnoteClick(paragraph.content),
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
                                    className={`cursor-pointer hover:opacity-80 ${isDarkMode ? "text-zinc-900" : ""}`}
                                    style={{
                                      backgroundColor: highlight.color,
                                      // padding: "2px 4px",
                                      // borderRadius: "4px",
                                      marginRight: "2px",
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
                                    )}{" "}
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
