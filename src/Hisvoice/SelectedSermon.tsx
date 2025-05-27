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

// Enhanced paragraph interface
interface SermonParagraph {
  id: number;
  content: string;
  originalIndex: number;
}

// Receipt-style control panel component
const ReceiptStylePanel = ({
  show,
  onClose,
  sermon,
  onSearch,
  searchResults,
  currentMatch,
  onNavigateSearch,
  currentParagraph,
  onJumpToParagraph,
}: // theme,
{
  show: boolean;
  onClose: () => void;
  sermon: Sermon | null;
  onSearch: (query: string) => void;
  searchResults: { paragraphId: number; matches: number }[];
  currentMatch: number;
  onNavigateSearch: (direction: "next" | "prev") => void;
  currentParagraph: number;
  onJumpToParagraph: (paragraphId: number) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpToParagraph, setJumpToParagraph] = useState("");
  const { isDarkMode } = useTheme();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleJump = () => {
    const paragraphNum = parseInt(jumpToParagraph);
    if (paragraphNum && paragraphNum > 0) {
      onJumpToParagraph(paragraphNum);
      setJumpToParagraph("");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className={`absolute right-4 top-10 w-96 max-h-[80vh]  overflow-y-auto z-50  ${
            isDarkMode ? "bg-primary" : "bg-white"
          } border-2 border-dashed ${
            isDarkMode ? "border-primary" : "border-gray-400"
          } shadow-2xl font-mono text-sm`}
          style={{
            background: isDarkMode
              ? "linear-gradient(to bottom, #292524  0%, #292524  100%)"
              : "linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)",
            scrollbarWidth: "thin",
            scrollbarColor: !isDarkMode ? "#c0c0c0 #f3f4f6" : "#1c1917 #292524",
          }}
        >
          {/* Receipt Header */}
          <div
            className={`p-4 border-b-2 border-dashed ${
              isDarkMode ? "border-accent" : "border-gray-400"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3
                className={`font-bold text-lg ${
                  isDarkMode ? "text-accent" : "text-gray-800"
                }`}
              >
                SERMON CONTROL
              </h3>
              <button
                onClick={onClose}
                className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <X size={18} />
              </button>
            </div>
            <div
              className={`text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {"- ".repeat(20)}
            </div>
          </div>

          {/* Sermon Details */}
          {sermon && (
            <div
              className={`p-4 border-b border-dashed ${
                isDarkMode ? "border-primary" : "border-gray-400"
              }`}
            >
              <h4
                className={`font-bold mb-2 ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                SERMON DETAILS
              </h4>
              <div
                className={`space-y-1 text-xs ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <div>TITLE: {sermon.title}</div>
                <div>LOCATION: {sermon.location}</div>
                <div>YEAR: {sermon.year || "N/A"}</div>
                <div>TYPE: {sermon.type}</div>
              </div>
              <div
                className={`text-center mt-2 ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {"· ".repeat(15)}
              </div>
            </div>
          )}

          {/* Current Position */}
          <div
            className={`p-4 border-b border-dashed ${
              isDarkMode ? "border-primary" : "border-gray-400"
            }`}
          >
            <h4
              className={`font-bold mb-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              CURRENT POSITION
            </h4>
            <div
              className={`text-center text-lg font-bold ${
                isDarkMode ? "text-orange-200" : "text-orange-200"
              }`}
            >
              PARAGRAPH #{currentParagraph}
            </div>
          </div>

          {/* Jump to Paragraph */}
          <div
            className={`p-4 border-b  border-das ${
              isDarkMode ? "border-accent " : "border-gray-400"
            }`}
          >
            <h4
              className={`font-bold mb-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              JUMP TO PARAGRAPH
            </h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={jumpToParagraph}
                onChange={(e) => setJumpToParagraph(e.target.value)}
                placeholder="Par. #"
                className={`flex-1 px-2 py-2 border-none text-xs rounded-full ring-1 ring-accent outline-none ${
                  isDarkMode
                    ? "bg-background border-accent  text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleJump()}
              />
              <button
                onClick={handleJump}
                className={`px-3 py-1 text-xs font-bold border-2 border-dashed transition-colors ${
                  isDarkMode
                    ? "bg-stone-700 border-stone-500 text-accent hover:bg-stone-600"
                    : "bg-gray-200 border-gray-400 text-gray-700 hover:bg-gray-300"
                }`}
              >
                GO
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div
            className={`p-4 border-b border-dashed ${
              isDarkMode ? "border-primary" : "border-gray-400"
            }`}
          >
            <h4
              className={`font-bold mb-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              SEARCH SERMON
            </h4>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search term..."
                  className={`flex-1 px-2 py-2 border-none text-xs rounded-full  ${
                    isDarkMode
                      ? "bg-background border-primary text-gray-200 ring-red ring-accent outline-none"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className={`px-3 py-1 text-xs font-bold border-2 border-dashed transition-colors ${
                    isDarkMode
                      ? "bg-stone-800 border-stone-600 text-accent hover:bg-stone-700"
                      : "bg-blue-200 border-blue-400 text-blue-700 hover:bg-blue-300"
                  }`}
                >
                  <Search size={12} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    FOUND:{" "}
                    {searchResults.reduce(
                      (sum, result) => sum + result.matches,
                      0
                    )}{" "}
                    matches in {searchResults.length} paragraphs
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onNavigateSearch("prev")}
                      className={`flex-1 px-2 py-1 text-xs border border-dashed transition-colors ${
                        isDarkMode
                          ? "border-primary text-gray-300 hover:bg-primary"
                          : "border-gray-400 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronUp size={12} className="inline mr-1" />
                      PREV
                    </button>
                    <button
                      onClick={() => onNavigateSearch("next")}
                      className={`flex-1 px-2 py-1 text-xs border border-dashed transition-colors ${
                        isDarkMode
                          ? "border-primary text-gray-300 hover:bg-primary"
                          : "border-gray-400 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronDown size={12} className="inline mr-1" />
                      NEXT
                    </button>
                  </div>
                  <div
                    className={`text-center text-xs ${
                      isDarkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  >
                    MATCH {currentMatch + 1} OF{" "}
                    {searchResults.reduce(
                      (sum, result) => sum + result.matches,
                      0
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Footer */}
          <div
            className={`p-4 text-center ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            <div className="text-xs">{"* ".repeat(10)}</div>
            <div className="text-xs mt-1">THANK YOU FOR READING</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SaveNotification = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed z-30 bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Progress saved successfully! ✓
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
  const [currentParagraph, setCurrentParagraph] = useState(1);
  const [searchResults, setSearchResults] = useState<
    { paragraphId: number; matches: number }[]
  >([]);
  const [currentSearchMatch, setCurrentSearchMatch] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const [sermonTColor, setSermonTColor] = useState("#a8a29e ");

  // Function to split sermon into paragraphs with appropriate length
  const sermonParagraphs = useMemo((): SermonParagraph[] => {
    if (!selectedMessage?.sermon) return [];

    const rawParagraphs = selectedMessage.sermon
      .split("\n\n")
      .filter((p) => p.trim());
    const processedParagraphs: SermonParagraph[] = [];
    let paragraphId = 1;

    rawParagraphs.forEach((paragraph, originalIndex) => {
      const words = paragraph.trim().split(/\s+/);
      const sentences = paragraph.split(/[.!?]+/).filter((s) => s.trim());

      // Determine optimal paragraph length based on content
      let targetLength: number;
      if (sentences.length <= 2 && words.length < 50) {
        targetLength = words.length; // Keep short paragraphs as is
      } else if (words.length <= 150) {
        targetLength = words.length; // Medium paragraphs stay whole
      } else {
        targetLength = Math.max(
          100,
          Math.min(
            200,
            Math.floor(words.length / Math.ceil(words.length / 150))
          )
        );
      }

      if (words.length <= targetLength) {
        processedParagraphs.push({
          id: paragraphId++,
          content: paragraph.trim(),
          originalIndex,
        });
      } else {
        // Split long paragraphs intelligently
        let currentChunk = "";
        let wordCount = 0;

        words.forEach((word) => {
          if (
            wordCount > 0 &&
            (wordCount >= targetLength ||
              (wordCount >= targetLength * 0.8 && /[.!?]$/.test(word)))
          ) {
            processedParagraphs.push({
              id: paragraphId++,
              content: currentChunk.trim(),
              originalIndex,
            });
            currentChunk = word;
            wordCount = 1;
          } else {
            currentChunk += (wordCount > 0 ? " " : "") + word;
            wordCount++;
          }
        });

        if (currentChunk.trim()) {
          processedParagraphs.push({
            id: paragraphId++,
            content: currentChunk.trim(),
            originalIndex,
          });
        }
      }
    });

    return processedParagraphs;
  }, [selectedMessage?.sermon]);

  const highlightEndnotes = (text: string) => {
    const endnoteRegex = /Endnote/gi;
    const parts = text.split(endnoteRegex);

    return (
      <span>
        {parts.map((part, i, arr) =>
          i < arr.length - 1 ? (
            <React.Fragment key={i}>
              {part}
              <span
                className="bg-yellow-500 text-orange-900 px-1 rounded"
                title="William branham quote.🗝️🗝️ WMB quote ends when you dont find the paragraph numbers anymore"
              >
                Endnote
              </span>
            </React.Fragment>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const highlightSearchText = useCallback((text: string, query: string) => {
    if (!query?.trim()) return highlightEndnotes(text);

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part: string, i: number) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="text-backgroun text-white rounded-md"
              style={{
                backgroundColor: "#9a674a",
                padding: "4px",
              }}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{highlightEndnotes(part)}</span>
          )
        )}
      </span>
    );
  }, []);

  // Search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchMatch(0);
      return;
    }

    const results: { paragraphId: number; matches: number }[] = [];
    const regex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );

    sermonParagraphs.forEach((paragraph) => {
      const matches = (paragraph.content.match(regex) || []).length;
      if (matches > 0) {
        results.push({ paragraphId: paragraph.id, matches });
      }
    });

    setSearchResults(results);
    setCurrentSearchMatch(0);

    // Navigate to first match
    if (results.length > 0) {
      jumpToParagraph(results[0].paragraphId);
    }
  };

  // Navigate search results
  const handleNavigateSearch = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return;

    const totalMatches = searchResults.reduce(
      (sum, result) => sum + result.matches,
      0
    );
    let newMatchIndex = currentSearchMatch;

    if (direction === "next") {
      newMatchIndex = (currentSearchMatch + 1) % totalMatches;
    } else {
      newMatchIndex =
        currentSearchMatch === 0 ? totalMatches - 1 : currentSearchMatch - 1;
    }

    setCurrentSearchMatch(newMatchIndex);

    // Find which paragraph this match belongs to
    let matchCount = 0;
    for (const result of searchResults) {
      if (matchCount + result.matches > newMatchIndex) {
        jumpToParagraph(result.paragraphId);
        break;
      }
      matchCount += result.matches;
    }
  };

  // Jump to specific paragraph
  const jumpToParagraph = (paragraphId: number) => {
    const element = document.getElementById(`paragraph-${paragraphId}`);
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementTop = element.offsetTop;
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      container.scrollTo({
        top: elementTop - containerHeight / 2 + element.clientHeight / 2,
        behavior: "smooth",
      });
    }
  };

  // Track current paragraph based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setScrollPosition(scrollTop);

      // Find current paragraph in view
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 1;

      let closestParagraph = 1;
      let closestDistance = Infinity;

      sermonParagraphs.forEach((paragraph) => {
        const element = document.getElementById(`paragraph-${paragraph.id}`);
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const distance = Math.abs(
            elementRect.top + elementRect.height / 2 - centerY
          );
          if (distance < closestDistance) {
            closestDistance = distance;
            closestParagraph = paragraph.id;
          }
        }
      });

      setCurrentParagraph(closestParagraph);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sermonParagraphs]);

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
    setSermonTColor(isDarkMode ? "#a8a29e" : "#6c6c6c");
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
  }, [pendingSearchNav, selectedMessage, setPendingSearchNav]);

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
    <div className="bg-white dark:bg-background h-screen  relative  w-screen">
      <SaveNotification
        show={showSaveNotification}
        onClose={() => setShowSaveNotification(false)}
      />

      {/* Floating Control Button */}
      {selectedMessage?.type === "text" && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowControlPanel(!showControlPanel)}
          className={`fixed right-6 bottom-3 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isDarkMode
              ? "bg-primary hover:bg-gray-700 text-gray-200"
              : "bg-white hover:bg-gray-50 text-gray-700"
          } border-2 ${
            showControlPanel
              ? isDarkMode
                ? "border-blue-500"
                : "border-blue-500"
              : isDarkMode
              ? "border-primary"
              : "border-gray-300"
          }`}
        >
          <BookOpen size={24} className="mx-auto" />
        </motion.button>
      )}

      {/* Receipt Style Control Panel */}
      <ReceiptStylePanel
        show={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        sermon={selectedMessage}
        onSearch={handleSearch}
        searchResults={searchResults}
        currentMatch={currentSearchMatch}
        onNavigateSearch={handleNavigateSearch}
        currentParagraph={currentParagraph}
        onJumpToParagraph={jumpToParagraph}
        // theme={isDarkMode}
      />

      <div className="bg-center flex flex-col pb-10 ">
        <div className="mb-5 h-full">
          <div
            className="rounded-lg px-4 h-[100vh] overflow-y-scroll overflow-x-hidden no-scrollbar text-wrap"
            ref={scrollContainerRef}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: !isDarkMode
                ? "#c0c0c0 #f3f4f6"
                : "#422e22 #202020",
            }}
          >
            {selectedMessage?.type === "text" ? (
              <div className="h-full  mx-auto px-12 ">
                <div className="absolute flex-col items-center gap-10 top-60 left-4 ">
                  {/* two colors rounded cricles verticall arranage */}
                  <div
                    className={`h-2 w-2 rounded-full mb-5 left-0 hover:scale-105 duration-75 cursor-pointer ${
                      isDarkMode ? "bg-[#f9fafb]" : "bg-[#1c1917]"
                    }`}
                    onClick={() => {
                      setSermonTColor("");
                      setSermonTColor((prev) =>
                        isDarkMode ? "#f9fafb" : "#1c1917"
                      );
                    }}
                  >
                    <TextSelectIcon
                      className={` ${
                        isDarkMode
                          ? " text-[#f2b084]"
                          : "text-background textst"
                      }`}
                    />
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full mb-2 hover:scale-105 duration-75 cursor-pointer ${
                      isDarkMode ? "bg-[#a8a29e]" : "bg-[#57534e]"
                    }`}
                    onClick={() => {
                      setSermonTColor("");
                      setSermonTColor((prev) =>
                        isDarkMode ? "#a8a29e" : "#6c6c6c"
                      );
                    }}
                  >
                    {" "}
                    <TextSelectIcon
                      className={` ${
                        isDarkMode ? " text-[#f2b084]" : "text-background "
                      }`}
                    />
                  </div>
                </div>
                {/* Sermon Header */}
                <div className="mb-4 text-center text-background">
                  {/* <h1 className="text-4xl font-serif text-stone-500 dark:text-gray-50 font-bold mb-4">
                    {selectedMessage.title}
                  </h1> */}
                  <TypingVerse
                    verse={selectedMessage.title}
                    typingSpeed={40}
                    minHeight={0}
                    fontFamily="Zilla Slab"
                    fontSize={30}
                    color={isDarkMode ? "#cbcbcb " : "black "}
                    align="center"
                  />
                  {/* <p className="text-lg font-serif italic text-center text-stone-500 dark:text-gray-50">
                    {selectedMessage?.location}
                  </p> */}
                </div>

                {/* Paragraphed Content */}
                <div className="space-y-6 relative ">
                  {sermonParagraphs.map((paragraph) => (
                    <div
                      key={paragraph.id}
                      id={`paragraph-${paragraph.id}`}
                      className="relative group bg-transparent"
                    >
                      {/* Paragraph Number */}
                      <div
                        className={`absolute flex items-center ${
                          Number(settings.fontSize) > 40 ? "-top-10" : "-top-4"
                        } -left-10 font-zilla font-bold pb-3 w-12 text-right ${
                          currentParagraph === paragraph.id
                            ? isDarkMode
                              ? "text-[#d57a3e] font-bold"
                              : "text-[#4b2a14] font-bold"
                            : isDarkMode
                            ? "text-[#eba373]"
                            : "text-[#4b2a14]"
                        } transition-colors duration-200`}
                      >
                        #{" "}
                        <span style={{ fontSize: settings.fontSize + "px" }}>
                          {paragraph.id}
                        </span>
                      </div>

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
                        className={`absolute -right-12 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 ${
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

                      {/* Paragraph Content */}
                      <div
                        className={`leading-relaxed bg-transparent text-stone-600 dark:text-accent text-wrap break-words text-left py-2 rounded-r-lg transition-all duration-200 hover:underline ${
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
                          color: sermonTColor,
                        }}
                      >
                        {searchQuery
                          ? highlightSearchText(paragraph.content, searchQuery)
                          : highlightEndnotes(paragraph.content)}
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

SelectedSermon.propTypes = {
  background: PropTypes.bool.isRequired,
  setBackground: PropTypes.func.isRequired,
};

SaveNotification.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SelectedSermon;
