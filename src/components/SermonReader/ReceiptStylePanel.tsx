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
            className="fixed inset-0 z-40  "
            onClick={onClose}
          />

          {/* Modern Receipt Modal */}
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed left-[40%] top-[25%] transform -translate-x-1/2 -translate-y-1/2 w-80 max-h-[80vh] overflow-y-auto no-scrollbar z-50 rounded-lg shadow-lg border ${
              isDarkMode
                ? "bg-stone-900/95 border border-stone-700/50"
                : "bg-white/95 border border-stone-200/50"
            }`}
            style={{
              fontFamily: "Garamond, Georgia, serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modern Header */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isDarkMode
                      ? "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                      : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sermon Information Card */}
            {sermon && (
              <div className="px-6 pb-6">
                <div
                  className={`p-4 rounded-lg 
                     ${
                       isDarkMode
                         ? "bg-gradient-to-r from-amber-900/20 to-stone-800/50 border border-amber-800/30"
                         : "bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/50"
                     }
                    `}
                >
                  <div className="space-y-3">
                    <div>
                      <h4
                        className={`font-semibold text-sm uppercase tracking-wide ${
                          isDarkMode ? "text-stone-400" : "text-stone-500"
                        }`}
                      >
                        Sermon Details
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-stone-300" : "text-stone-600"
                          }`}
                        >
                          Title
                        </span>
                        <span
                          className={`text-sm font-semibold text-right max-w-48 ${
                            isDarkMode ? "text-stone-100" : "text-stone-800"
                          }`}
                        >
                          {sermon.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-stone-300" : "text-stone-600"
                          }`}
                        >
                          Location
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-stone-100" : "text-stone-800"
                          }`}
                        >
                          {sermon.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-stone-300" : "text-stone-600"
                          }`}
                        >
                          Year
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-stone-100" : "text-stone-800"
                          }`}
                        >
                          {sermon.year || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current Position Card */}
            {/*  */}

            {/* Footer */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReceiptStylePanel;
