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
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className={`fixed left-[40%] top-[30%] transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-[75vh] overflow-y-auto no-scrollbar z-50 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              isDarkMode
                ? "bg-stone-900/95 border-stone-700/70 shadow-stone-950/50"
                : "bg-white/95 border-stone-200/70 shadow-stone-900/10"
            }`}
            style={{
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modern Header */}
            <div className="p-6 pb-3">
              <div className="flex justify-between items-center">
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-stone-200" : "text-stone-800"
                  }`}
                >
                  Sermon Info
                </h3>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
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
                  className={`p-5 rounded-xl shadow-sm ${
                    isDarkMode
                      ? "bg-gradient-to-br from-stone-800/50 to-stone-800/30 border border-stone-700/50"
                      : "bg-gradient-to-br from-stone-50 to-white border border-stone-200/50"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? "text-stone-500" : "text-stone-400"
                          }`}
                        >
                          Title
                        </span>
                        <span
                          className={`text-sm font-semibold leading-snug ${
                            isDarkMode ? "text-stone-200" : "text-stone-800"
                          }`}
                        >
                          {sermon.title}
                        </span>
                      </div>

                      <div
                        className={`h-px ${
                          isDarkMode ? "bg-stone-700/50" : "bg-stone-200/50"
                        }`}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`text-xs font-medium uppercase tracking-wider ${
                              isDarkMode ? "text-stone-500" : "text-stone-400"
                            }`}
                          >
                            Location
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isDarkMode ? "text-stone-200" : "text-stone-700"
                            }`}
                          >
                            {sermon.location}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`text-xs font-medium uppercase tracking-wider ${
                              isDarkMode ? "text-stone-500" : "text-stone-400"
                            }`}
                          >
                            Year
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isDarkMode ? "text-stone-200" : "text-stone-700"
                            }`}
                          >
                            {sermon.year || "N/A"}
                          </span>
                        </div>
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
