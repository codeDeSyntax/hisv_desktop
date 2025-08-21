import React, { useState, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChromeStyleSearchProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchResultsCount: number;
  currentSearchIndex: number;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
}

export const ChromeStyleSearch: React.FC<ChromeStyleSearchProps> = ({
  isVisible,
  onClose,
  onSearch,
  searchResultsCount,
  currentSearchIndex,
  onNavigateNext,
  onNavigatePrevious,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isVisible]);

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  // Handle outside click to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (e.shiftKey) {
        onNavigatePrevious();
      } else {
        onNavigateNext();
      }
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="fixed top-6 right-6 z-50 border border-stone-200/50 dark:border-amber-900/30 rounded-2xl "
          style={{ minWidth: "340px" }}
        >
          {/* Main Search Container */}
          <div className="p-4">
            {/* Search Input Section */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  spellCheck={false}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search in sermon or paragraph number..."
                  className="w-full px-4 py-3 text-sm border-0 rounded-xl bg-stone-100/20 dark:bg-yellow-900/20  text-stone-800 dark:text-amber-100 placeholder-yellow-900 dark:placeholder-text focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-text/20 transition-all duration-200 shadow-inne placeholder:font-zilla font-zilla"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:text-amber-400/70 dark:hover:text-amber-300 dark:bg-amber-900 hover:bg-stone-100/50 dark:hover:bg-amber-900/30 transition-all duration-200"
                  >
                    <X size={16} />
                  </button>
                )}

                <div
                  onClick={onClose}
                  className="absolute left-[100%] top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-white rounded-r-full bg-yellow-900  dark:bg-amber-500 hover:bg-yellow-700 cursor-pointer dark:hover:bg-amber-900/30 transition-all duration-200"
                >
                  <X size={16} />
                </div>
              </div>

              {/* Close Button */}
              {/* <button
                onClick={onClose}
                className="p-2 z-20 rounded-xl bg-stone-100/50 dark:bg-amber-900/30 text-stone-500 dark:text-amber-400/70 hover:text-stone-700 dark:hover:text-amber-300 hover:bg-stone-200/50 dark:hover:bg-amber-800/40 transition-all duration-200 shadow-sm"
                title="Close (Esc)"
              >
                <X size={18} />
              </button> */}
            </div>

            {/* Results and Navigation Section */}
            {searchQuery && (
              <div
                className="flex items-center justify-between p-3 dark:bg-yellow-900/20  rounded-xl border border-stone-200/30 dark:border-amber-900/20"
                style={{
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Results Counter */}
                <div className="text-sm font-medium text-stone-600 dark:text-amber-200/80">
                  {searchResultsCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></span>
                      {currentSearchIndex} of {searchResultsCount} matches
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-stone-500 dark:text-amber-300/60">
                      <span className="w-2 h-2 bg-stone-400 dark:bg-amber-600/50 rounded-full"></span>
                      No results found
                    </span>
                  )}
                </div>

                {/* Navigation Buttons */}
                {searchResultsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onNavigatePrevious}
                      className="p-2 rounded-lg bg-stone/50 dark:bg-amber-900/40 text-stone-600 dark:text-amber-300 hover:text-stone-800 dark:hover:text-amber-100 hover:bg-white/80 dark:hover:bg-amber-800/60 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Previous (Shift+Enter)"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={onNavigateNext}
                      className="p-2 rounded-lg bg-stone/50 dark:bg-amber-900/40 text-stone-600 dark:text-amber-300 hover:text-stone-800 dark:hover:text-amber-100 hover:bg-white/80 dark:hover:bg-amber-800/60 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Next (Enter)"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChromeStyleSearch;
