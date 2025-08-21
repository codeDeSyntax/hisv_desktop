import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  ChevronDown,
  Mic2,
  LetterText,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

interface ModularBookmarksProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

const ModularBookmarks: React.FC<ModularBookmarksProps> = ({
  className = "",
  showHeader = true,
  maxHeight = "100%",
}) => {
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

  const handleBookmarkClick = (bookmark: any) => {
    navigateToBookmark(bookmark);
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
    <div className={`${className} h-full flex flex-col`} style={{ maxHeight }}>
      {showHeader && (
        <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700">
          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-center text-xs">
            <div className="p-2 border border-dashed border-stone-200 dark:border-amber-900/30 rounded">
              <div className="font-bold text-amber-600 dark:text-amber-400">
                {stats.totalBookmarks}
              </div>
              <div className="text-stone-600 dark:text-orange-200">
                BOOKMARKS
              </div>
            </div>
            <div className="p-2 border border-dashed border-stone-200 dark:border-amber-900/30 rounded">
              <div className="font-bold text-amber-600 dark:text-amber-400">
                {stats.uniqueSermons}
              </div>
              <div className="text-stone-600 dark:text-amber-200">SERMONS</div>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-2 mb-4">
            <input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 text-sm bg-white dark:bg-primary border-none border-gray-300 dark:border-stone-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-[#42413f] text-stone-700 dark:text-white placeholder-gray-500"
              spellCheck={false}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-primary border border-stone-200 dark:border-amber-900/30 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-700 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-stone-700 dark:text-gray-300">
              {searchQuery ? "No bookmarks found" : "No bookmarks yet"}
            </span>
          </div>
        ) : (
          <div className="h-full flex flex-col font-zilla backdrop-blur-sm rounded-lg border border-stone-200 dark:border-amber-900/30">
            {/* Fixed Table Header */}
            <div className="flex-shrink-0">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-amber-950/50 dark:to-stone-900/80">
                  <tr className="border-b border-stone-200 dark:border-amber-900/40">
                    <th className="text-left px-3 py-2.5 text-stone-700 dark:text-orange-200 font-medium text-sm font-zilla">
                      <span>Sermon & Content</span>
                    </th>
                    <th className="text-left px-3 py-2.5 text-stone-700 dark:text-amber-200 font-medium text-sm font-zilla w-24">
                      <span>Details</span>
                    </th>
                    <th className="text-center px-3 py-2.5 text-stone-700 dark:text-orange-200 font-medium text-sm font-zilla w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full">
                <tbody className="divide-y divide-stone-100 dark:divide-amber-900/20">
                  <AnimatePresence>
                    {filteredBookmarks.map((bookmark, index) => (
                      <motion.tr
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="cursor-pointer group transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-stone-50/80 dark:hover:from-amber-950/20 dark:hover:to-stone-900/20 hover:shadow-sm"
                        onClick={() => handleBookmarkClick(bookmark)}
                      >
                        <td className="px-3 text-stone-800 dark:text-text group-hover:text-amber-700 dark:group-hover:text-text/60 transition-colors text-sm leading-tight font-zilla border-x-0 border-t-0 border-b border-solid border-stone-200 dark:border-text/20">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <BookmarkCheck
                                size={12}
                                className="text-amber-600 dark:text-amber-400"
                              />
                              <span className="font-medium line-clamp-1 text-yellow-800 dark:text-orange-300 overflow-hidden text-sm">
                                {bookmark.sermonTitle}
                              </span>
                            </div>
                            <span className="text-xs text-stone-600 dark:text-orange-100 line-clamp-2 ml-5">
                              "{bookmark.paragraphContent}"
                            </span>
                            {bookmark.location && (
                              <div className="flex items-center gap-1 ml-5 text-xs text-stone-500 dark:text-stone-400">
                                <MapPin size={10} />
                                <span>{bookmark.location}</span>
                                {bookmark.paragraphId && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-orange-900 dark:text-stone-400 font-bold">
                                      Para #{bookmark.paragraphId}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 text-stone-600 dark:text-amber-200 font-medium text-xs font-zilla w-24">
                          <div className="flex flex-col gap-1">
                            {bookmark.year && (
                              <div className="flex items-center gap-1">
                                <Calendar size={10} />
                                <span>{bookmark.year}</span>
                              </div>
                            )}
                            <span className="text-stone-500 dark:text-stone-400">
                              {formatDate(bookmark.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 text-center w-16">
                          <div className="flex justify-center">
                            {showDeleteConfirm === bookmark.id ? (
                              <div className="flex gap-1">
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBookmark(bookmark.id);
                                  }}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <BookmarkCheck size={8} />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(null);
                                  }}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  ×
                                </motion.button>
                              </div>
                            ) : (
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(bookmark.id);
                                }}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-[#4a2e19] dark:to-[#4a2e19] shadow-sm transition-transform group-hover:scale-110"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2
                                  size={10}
                                  className="text-red-600 dark:text-red-400"
                                />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModularBookmarks;
