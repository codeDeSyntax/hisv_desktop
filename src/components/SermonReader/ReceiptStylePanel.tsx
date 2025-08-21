import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { Sermon } from "@/types";
import { SearchResult } from "./types";

interface ReceiptStylePanelProps {
  show: boolean;
  onClose: () => void;
  sermon: Sermon | null;
  onSearch: (query: string) => void;
  searchResults: SearchResult[];
  currentMatch: number;
  onNavigateSearch: (direction: "next" | "prev") => void;
  currentParagraph: number;
  onJumpToParagraph: (paragraphId: number) => void;
}

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
}: ReceiptStylePanelProps) => {
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
        <>
          {/* Simple backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Compact Receipt Modal */}
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`absolute right-4 top-10 w-80 max-h-[85vh] overflow-y-auto no-scrollbar z-50 rounded-lg shadow-lg border ${
              isDarkMode
                ? "bg-stone-800 border-stone-600"
                : "bg-white border-stone-300"
            }`}
            style={{
              fontFamily: "Garamond, Georgia, serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compact Header */}
            <div
              className={`p-3 border-b ${
                isDarkMode ? "border-stone-600" : "border-stone-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-stone-100" : "text-stone-800"
                  }`}
                >
                  Reading Tools
                </h3>
                <button
                  onClick={onClose}
                  className={`p-1 rounded transition-colors ${
                    isDarkMode
                      ? "text-stone-400 hover:text-stone-200 hover:bg-stone-700"
                      : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sermon Information */}
            {sermon && (
              <div
                className={`p-3 border-b text-sm ${
                  isDarkMode ? "border-stone-600" : "border-stone-300"
                }`}
              >
                <div
                  className={`space-y-1 ${
                    isDarkMode ? "text-stone-300" : "text-stone-600"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Title:</span>
                    <span className="text-right max-w-40 truncate font-bold text-">
                      {sermon.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{sermon.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Year:</span>
                    <span className="font-medium">{sermon.year || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium uppercase text-xs">
                      {sermon.type}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Reading Position */}
            <div
              className={`p-3 border-b ${
                isDarkMode ? "border-stone-600" : "border-stone-300"
              }`}
            >
              <div
                className={`text-center py-2 px-3 rounded ${
                  isDarkMode
                    ? "bg-stone-700 text-stone-200"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                <div className="text-lg font-semibold">
                  Paragraph #{currentParagraph}
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div
              className={`p-3 border-b ${
                isDarkMode ? "border-stone-600" : "border-stone-300"
              }`}
            >
              <div className="mb-2">
                <h4
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-stone-200" : "text-stone-700"
                  }`}
                >
                  Jump to Paragraph
                </h4>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={jumpToParagraph}
                  onChange={(e) => setJumpToParagraph(e.target.value)}
                  placeholder="Enter #"
                  spellCheck={false}
                  className={`flex-1 px-2 pl-3 py-2 outline-none focus:ring-1 focus:ring-[#99674a] text-sm rounded-full border-none ${
                    isDarkMode
                      ? "bg-stone-700 border-stone-600 text-stone-200 placeholder-stone-400"
                      : "bg-stone-50 border-stone-300 text-stone-700 placeholder-stone-500"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleJump()}
                />
                <button
                  onClick={handleJump}
                  className={`px-3 py-1 bg-[#99674a] text-sm rounded border transition-colors ${
                    isDarkMode
                      ? "border-stone-600 bg-stone-600 text-stone-300 hover:bg-stone-700"
                      : "border-stone-300 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Go
                </button>
              </div>
            </div>

            {/* Search Section */}
            <div
              className={`p-3 border-b ${
                isDarkMode ? "border-stone-600" : "border-stone-300"
              }`}
            >
              <div className="mb-2">
                <h4
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-stone-200" : "text-stone-700"
                  }`}
                >
                  Search Sermon
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    spellCheck={false}
                    className={`flex-1 px-2 pl-3 outline-none py-2 text-sm  focus:ring-1 focus:ring-[#99674a] rounded-full border-none ${
                      isDarkMode
                        ? "bg-stone-700 border-stone-600 text-stone-200 placeholder-stone-400"
                        : "bg-stone-50 border-stone-300 text-stone-700 placeholder-stone-500"
                    }`}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className={`px-3 py-1 bg-[#99674a] text-sm rounded border transition-colors ${
                      isDarkMode
                        ? "border-stone-600 text-stone-300 hover:bg-stone-700"
                        : "border-stone-300 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Search size={14} />
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <div
                      className={`text-xs p-2 rounded ${
                        isDarkMode
                          ? "bg-stone-700 text-stone-300"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {searchResults.reduce(
                        (sum, result) => sum + result.matches,
                        0
                      )}{" "}
                      matches in {searchResults.length} paragraphs
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onNavigateSearch("prev")}
                        className={`flex-1 bg-[#99674a] px-2 py-1 text-xs rounded border transition-colors ${
                          isDarkMode
                            ? "border-stone-600 text-stone-300 hover:bg-stone-700"
                            : "border-stone-300 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        ↑ Prev
                      </button>
                      <button
                        onClick={() => onNavigateSearch("next")}
                        className={`flex-1 px-2 bg-[#99674a] py-1 text-xs rounded border transition-colors ${
                          isDarkMode
                            ? "border-stone-600 text-stone-300 hover:bg-stone-700"
                            : "border-stone-300 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        Next ↓
                      </button>
                    </div>
                    <div
                      className={`text-center text-xs ${
                        isDarkMode ? "text-stone-400" : "text-stone-500"
                      }`}
                    >
                      {currentMatch + 1} of{" "}
                      {searchResults.reduce(
                        (sum, result) => sum + result.matches,
                        0
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className={`p-2 text-center ${
                isDarkMode ? "text-stone-500" : "text-stone-500"
              }`}
            >
              <div className="text-xs opacity-50">Reading Tools</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReceiptStylePanel;
