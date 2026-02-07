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
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
            type: "spring",
            stiffness: 350,
            damping: 28,
          }}
          className="fixed top-20 right-8 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl shadow-stone-900/10 dark:shadow-stone-950/50"
          style={{ minWidth: "380px", maxWidth: "420px" }}
        >
          {/* Main Search Container */}
          <div className="p-2">
            {/* Search Input Section */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  spellCheck={false}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search in sermon or paragraph number..."
                  className="w-full px-4 py-3 text-sm border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md placeholder:font-zilla font-zilla"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={handleClear}
                    className="absolute bg-stone-200 dark:bg-stone-700 right-12 cursor-pointer top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-all duration-200"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="absolute right-2 top-1/2 bg-red-800   transform -translate-y-1/2 p-1.5 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/50 cursor-pointer transition-all duration-200"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
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
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30"
                style={{
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Results Counter */}
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {searchResultsCount > 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-stone-600 dark:bg-stone-400 rounded-full animate-pulse shadow-sm"></span>
                      <span className="font-semibold">
                        {currentSearchIndex}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">
                        of
                      </span>
                      <span className="font-semibold">
                        {searchResultsCount}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">
                        matches
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                      <span className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full"></span>
                      No results found
                    </span>
                  )}
                </div>

                {/* Navigation Buttons */}
                {searchResultsCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onNavigatePrevious}
                      className="p-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Previous (Shift+Enter)"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={onNavigateNext}
                      className="p-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
