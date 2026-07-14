import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkCheck, Trash2, Search } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

interface ModularBookmarksProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  onSelect?: () => void;
}

const ModularBookmarks: React.FC<ModularBookmarksProps> = ({
  className = "",
  showHeader = true,
  maxHeight = "100%",
  onSelect,
}) => {
  const { bookmarks, removeBookmark, navigateToBookmark } = useSermonContext();
  const { accentColor } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

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
          bookmark.location.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const handleDelete = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    const diffDays = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 86_400_000,
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  const uniqueSermons = new Set(bookmarks.map((b) => b.sermonId)).size;

  return (
    <div
      className={`${className} h-full flex flex-col gap-2.5 w-full`}
      style={{ maxHeight }}
    >
      {/* Stats — only when showHeader */}
      {showHeader && bookmarks.length > 0 && (
        <div className="flex-shrink-0 flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {bookmarks.length}
            </span>{" "}
            bookmarks
          </span>
          <span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {uniqueSermons}
            </span>{" "}
            sermons
          </span>
        </div>
      )}

      {/* Search */}
      <div className="flex-shrink-0 relative">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          placeholder="Search bookmarks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 text-xs border-none bg-zinc-100/80 dark:bg-zinc-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
          spellCheck={false}
        />
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-1">
        {filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-1 text-zinc-400 dark:text-zinc-500">
            <BookmarkCheck
              size={32}
              strokeWidth={1.2}
              style={{ color: accentColor }}
            />
            <p className="text-sm">
              {searchQuery ? "No matches found" : "No bookmarks yet"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-center max-w-[180px] leading-relaxed">
                Tap the bookmark icon while reading a sermon to save it here
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.14,
                  delay: Math.min(index * 0.03, 0.2),
                }}
                className="group relative rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 px-3 py-2.5 cursor-pointer transition-all duration-150 hover:border-zinc-200 dark:hover:border-zinc-700"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = accentColor + "50")
                }
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                onClick={() => {
                  navigateToBookmark(bookmark);
                  onSelect?.();
                }}
              >
                {/* Title + actions row */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <BookmarkCheck
                      size={10}
                      className="flex-shrink-0 mt-px"
                      style={{ color: accentColor }}
                    />
                    <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                      {bookmark.sermonTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-700 whitespace-nowrap">
                      {formatDate(bookmark.createdAt)}
                    </span>

                    {showDeleteConfirm === bookmark.id ? (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(bookmark.id);
                          }}
                          className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] font-bold transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                          className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-500 flex items-center justify-center text-[10px] transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(bookmark.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full flex items-center justify-center transition-opacity duration-150 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2
                          size={10}
                          className="text-zinc-400 dark:text-zinc-500"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Paragraph preview */}
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 ml-[14px] leading-relaxed italic">
                  {(bookmark.year || bookmark.paragraphId || bookmark.location) && (
                    <span className="not-italic font-semibold text-zinc-300 dark:text-zinc-600 mr-1">
                      {[
                        bookmark.year,
                        bookmark.paragraphId ? `¶${bookmark.paragraphId}` : null,
                        bookmark.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      —{" "}
                    </span>
                  )}
                  &ldquo;{bookmark.paragraphContent}&rdquo;
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ModularBookmarks;
