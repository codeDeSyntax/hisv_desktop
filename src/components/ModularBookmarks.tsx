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
      className={`${className} h-full flex flex-col gap-2 w-full max-w-2xl m-auto`}
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

      {/* Search — always visible */}
      <div className="flex-shrink-0 relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          placeholder="Search bookmarks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border-none bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent text-zinc-700 dark:text-zinc-100 placeholder-zinc-400"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{
                  duration: 0.16,
                  delay: Math.min(index * 0.04, 0.28),
                }}
                className="group relative rounded-lg border-solid border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 px-3 cursor-pointer hover:shadow-sm transition-colors duration-150"
                style={{ "--hover-border": accentColor } as React.CSSProperties}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = accentColor + "60")
                }
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                onClick={() => {
                  navigateToBookmark(bookmark);
                  onSelect?.();
                }}
              >
                {/* Title row */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookmarkCheck
                      size={12}
                      className="flex-shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                      {bookmark.sermonTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Saved date — lives beside the title, out of the way */}
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600 whitespace-nowrap">
                      {formatDate(bookmark.createdAt)}
                    </span>

                    {/* Delete controls */}
                    {showDeleteConfirm === bookmark.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(bookmark.id);
                          }}
                          className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/60 flex items-center justify-center text-xs font-bold transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                          className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center text-xs transition-colors"
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
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-opacity duration-150"
                      >
                        <Trash2
                          size={11}
                          className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Paragraph preview — meta prefix inline with the quote */}
                <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 ml-[18px] leading-relaxed italic">
                  {(bookmark.year ||
                    bookmark.paragraphId ||
                    bookmark.location) && (
                    <span className="not-italic font-semibold text-zinc-400 dark:text-zinc-500 mr-1">
                      {[
                        bookmark.year,
                        bookmark.paragraphId
                          ? `¶${bookmark.paragraphId}`
                          : null,
                        bookmark.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      —{" "}
                    </span>
                  )}
                  &ldquo;{bookmark.paragraphContent}&rdquo;
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ModularBookmarks;
