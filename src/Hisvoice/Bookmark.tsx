import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

const BookmarksPage = () => {
  const { bookmarks, removeBookmark, navigateToBookmark, allSermons } =
    useSermonContext();
  const { isDarkMode } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(
      (bookmark) =>
        bookmark.sermonTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        bookmark.paragraphContent
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (bookmark.location &&
          bookmark.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title":
          return a.sermonTitle.localeCompare(b.sermonTitle);
        case "year":
          return (b.year || "0").localeCompare(a.year || "0");
        default:
          return 0;
      }
    });

  const handleDeleteBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSermonStats = () => {
    const uniqueSermons = new Set(bookmarks.map((b) => b.sermonId)).size;
    const totalBookmarks = bookmarks.length;
    return { uniqueSermons, totalBookmarks };
  };

  const stats = getSermonStats();

  return (
    <div
      className={`h-[90vh] p-6  overflow-y-scroll no-scrollbar ${
        isDarkMode ? "bg-background" : "bg-gray-50"
      }`}
    >
      {/* Receipt Header */}
      <div
        className={`max-w-4xl mx-auto mb-8 p-3 mt-10 font-mono ${
          isDarkMode ? "bg-primary border-accent" : "bg-white border-gray-300"
        } border-2 border-dashed shadow-lg`}
      >
        <div className="text-center mb-4">
          <h1
            className={`text-2xl font-bold ${
              isDarkMode ? "text-accent" : "text-gray-800"
            }`}
          >
            SERMON BOOKMARKS
          </h1>
          <div className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {"═".repeat(30)}
          </div>
        </div>

        {/* Stats Section */}
        <div
          className={`grid grid-cols-2 gap-4 text-center mb-4 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <div
            className={`p-3 border border-dashed ${
              isDarkMode
                ? "border-accent bg-stone-800"
                : "border-gray-400 bg-gray-50"
            }`}
          >
            <div className="text-2xl font-bold text-orange-500">
              {stats.totalBookmarks}
            </div>
            <div className="text-xs">TOTAL BOOKMARKS</div>
          </div>
          <div
            className={`p-3 border border-dashed ${
              isDarkMode
                ? "border-accent bg-stone-800"
                : "border-gray-400 bg-gray-50"
            }`}
          >
            <div className="text-2xl font-bold text-blue-500">
              {stats.uniqueSermons}
            </div>
            <div className="text-xs">UNIQUE SERMONS</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm border-2 border-dashed ${
                  isDarkMode
                    ? "bg-stone-800 border-accent text-gray-200 placeholder-gray-500"
                    : "bg-white border-gray-400 text-gray-700 placeholder-gray-400"
                } focus:outline-none focus:border-orange-500`}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 text-sm border-2 border-dashed ${
                isDarkMode
                  ? "bg-stone-800 border-accent text-gray-200"
                  : "bg-white border-gray-400 text-gray-700"
              } focus:outline-none focus:border-orange-500`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
              <option value="year">By Year</option>
            </select>
          </div>
        </div>

        <div
          className={`text-center mt-4 ${
            isDarkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {"- ".repeat(20)}
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="max-w-4xl mx-auto space-y-4 grid grid-cols-3 gap-2">
        {filteredBookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-12 font-mono ${
              isDarkMode
                ? "bg-primary border-accent"
                : "bg-white border-gray-300"
            } border-2 border-dashed`}
          >
            <Bookmark
              size={48}
              className={`mx-auto mb-4 ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-bold mb-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {searchQuery ? "NO MATCHING BOOKMARKS" : "NO BOOKMARKS YET"}
            </h3>
            <p className={`${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start bookmarking sermon paragraphs to see them here"}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative font-mono border-2 border-dashed shadow-lg ${
                  isDarkMode
                    ? "bg-primary border-accent hover:border-orange-500"
                    : "bg-white border-gray-400 hover:border-orange-500"
                } transition-all duration-200 hover:shadow-xl group`}
              >
                {/* Receipt Item Header */}
                <div
                  className={`p-4 border-b border-dashed ${
                    isDarkMode ? "border-accent" : "border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookmarkCheck size={16} className="text-yellow-500" />
                        <span
                          className={`text-xs font-bold ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          BOOKMARK #{bookmark.id.split("-").pop()?.slice(-4)}
                        </span>
                      </div>

                      <h3
                        className={`font-bold text-lg mb-2 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {bookmark.sermonTitle}
                      </h3>

                      <div
                        className={`flex flex-wrap gap-4 text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {bookmark.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{bookmark.location}</span>
                          </div>
                        )}
                        {bookmark.year && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{bookmark.year}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          <span>Paragraph #{bookmark.paragraphId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigateToBookmark(bookmark)}
                        className={`p-2 rounded transition-all duration-200 ${
                          isDarkMode
                            ? "bg-stone-700 hover:bg-stone-600 text-blue-400"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                        } hover:scale-110`}
                        title="Go to bookmark"
                      >
                        <ArrowRight size={14} />
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(bookmark.id)}
                        className={`p-2 rounded transition-all duration-200 ${
                          isDarkMode
                            ? "bg-stone-700 hover:bg-red-800 text-red-400"
                            : "bg-red-100 hover:bg-red-200 text-red-600"
                        } hover:scale-110`}
                        title="Delete bookmark"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-4">
                  <div
                    className={`text-sm leading-relaxed ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    "{bookmark.paragraphContent}"
                  </div>

                  <div
                    className={`text-xs mt-3 pt-3 border-t border-dashed ${
                      isDarkMode
                        ? "border-accent text-gray-500"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    SAVED: {formatDate(bookmark.createdAt)}
                  </div>
                </div>

                {/* Delete Confirmation Popup */}
                <AnimatePresence>
                  {showDeleteConfirm === bookmark.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`absolute inset-0 flex items-center justify-center ${
                        isDarkMode ? "bg-stone-900/90" : "bg-white/90"
                      } backdrop-blur-sm`}
                    >
                      <div
                        className={`p-6 border-2 border-dashed font-mono text-center ${
                          isDarkMode
                            ? "bg-stone-800 border-red-500 text-gray-200"
                            : "bg-white border-red-400 text-gray-800"
                        }`}
                      >
                        <h4 className="font-bold mb-3 text-red-500">
                          DELETE BOOKMARK?
                        </h4>
                        <p
                          className={`text-sm mb-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          This action cannot be undone
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold border-2 border-dashed border-red-400 transition-colors"
                          >
                            DELETE
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className={`px-4 py-2 text-sm font-bold border-2 border-dashed transition-colors ${
                              isDarkMode
                                ? "bg-stone-700 border-stone-500 text-gray-300 hover:bg-stone-600"
                                : "bg-gray-200 border-gray-400 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Receipt Footer */}
      {filteredBookmarks.length > 0 && (
        <div
          className={`max-w-4xl mx-auto mt-8 p-4 text-center font-mono ${
            isDarkMode ? "bg-primary border-accent" : "bg-white border-gray-300"
          } border-2 border-dashed`}
        >
          <div
            className={`text-xs ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {"* ".repeat(15)}
          </div>
          <div
            className={`text-sm mt-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            END OF BOOKMARKS LIST
          </div>
          <div
            className={`text-xs mt-1 ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            TOTAL: {filteredBookmarks.length} ITEMS
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
