import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Check,
  Clock3,
  History,
  LetterText,
  MapPin,
  Mic2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { Sermon } from "@/types";

interface ModularRecentsProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  limit?: number;
  onSelect?: () => void;
}

const ModularRecents: React.FC<ModularRecentsProps> = ({
  className = "",
  showHeader = true,
  maxHeight = "100%",
  limit,
  onSelect,
}) => {
  const { recentSermons, setSelectedMessage, setActiveTab, setRecentSermons } =
    useSermonContext();

  const { accentColor } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<Sermon["id"] | null>(
    null,
  );

  const filteredSermons = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return recentSermons;
    }

    return recentSermons.filter((sermon) =>
      [
        sermon.title,
        sermon.date,
        sermon.year,
        sermon.location,
        sermon.type === "mp3" ? "audio" : "text",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [recentSermons, searchQuery]);

  const displayedSermons = limit
    ? filteredSermons.slice(0, limit)
    : filteredSermons;

  const textCount = recentSermons.filter((sermon) => sermon.type !== "mp3")
    .length;
  const audioCount = recentSermons.length - textCount;

  const handleDelete = (id: Sermon["id"]) => {
    const updatedSermons = recentSermons.filter((sermon) => sermon.id !== id);
    setRecentSermons(updatedSermons);
    localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
    setDeleteConfirmId(null);
  };

  const handleSermonClick = (sermon: Sermon) => {
    setSelectedMessage(sermon);
    setActiveTab("message");

    // If there's a lastParagraph stored, navigate to it after setting the sermon
    if (sermon.lastParagraph) {
      setTimeout(() => {
        const element = document.getElementById(
          `paragraph-${sermon.lastParagraph}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); // Small delay to ensure the sermon content is rendered
    }

    // Update recent sermons list to move this sermon to the top
    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]",
    );
    const updatedRecentSermons = recentSermons.filter(
      (item: Sermon) => item.id !== sermon.id,
    );
    updatedRecentSermons.unshift(sermon);
    const limitedRecentSermons = updatedRecentSermons.slice(0, 15);
    localStorage.setItem("recentSermons", JSON.stringify(limitedRecentSermons));
    setRecentSermons(limitedRecentSermons);

    // Close sidebar after selection
    onSelect?.();
  };

  const formatSermonDate = (sermon: Sermon) => {
    if (sermon.date) return sermon.date;
    if (sermon.year) return sermon.year;
    return "Undated";
  };

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div
      className={`${className} h-full flex flex-col gap-2 bg-transparent w-full max-w-2xl m-auto`}
      style={{ maxHeight }}
    >
      {showHeader && recentSermons.length > 0 && (
        <div className="flex-shrink-0 flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {recentSermons.length}
            </span>{" "}
            recent
          </span>
          <span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {textCount}
            </span>{" "}
            text
          </span>
          <span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {audioCount}
            </span>{" "}
            audio
          </span>
        </div>
      )}

      <div className="flex-shrink-0 relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          placeholder="Search recents..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border-none bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent text-zinc-700 dark:text-zinc-100 placeholder-zinc-400"
          spellCheck={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-1">
        {displayedSermons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-1 text-zinc-400 dark:text-zinc-500">
            <History
              size={32}
              strokeWidth={1.2}
              style={{ color: accentColor }}
            />
            <p className="text-sm">
              {hasSearch ? "No matches found" : "No recent sermons yet"}
            </p>
            {!hasSearch && (
              <p className="text-xs text-center max-w-[190px] leading-relaxed">
                Sermons you open will appear here for quick return.
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {displayedSermons.map((sermon, index) => {
              const isAudio = sermon.type === "mp3";

              return (
                <motion.div
                  key={`${sermon.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{
                    duration: 0.16,
                    delay: Math.min(index * 0.04, 0.28),
                  }}
                  className="group relative rounded-lg border-solid border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 px-3 py-2.5 cursor-pointer hover:shadow-sm transition-colors duration-150"
                  onMouseEnter={(event) =>
                    (event.currentTarget.style.borderColor =
                      accentColor + "60")
                  }
                  onMouseLeave={(event) =>
                    (event.currentTarget.style.borderColor = "")
                  }
                  onClick={() => handleSermonClick(sermon)}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: isAudio
                          ? `${accentColor}18`
                          : "rgba(113, 113, 122, 0.12)",
                        color: isAudio ? accentColor : undefined,
                      }}
                    >
                      {isAudio ? (
                        <Mic2 size={14} className="ml-0.5" />
                      ) : (
                        <LetterText
                          size={14}
                          className="text-zinc-600 dark:text-zinc-300"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-snug text-zinc-800 dark:text-zinc-100 line-clamp-2">
                          {sermon.title}
                        </h3>

                        {deleteConfirmId === sermon.id ? (
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(sermon.id);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800/60"
                              aria-label="Confirm delete recent sermon"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                              aria-label="Cancel delete recent sermon"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteConfirmId(sermon.id);
                            }}
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity duration-150 hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-900/30"
                            aria-label="Remove from recents"
                          >
                            <Trash2
                              size={12}
                              className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                            />
                          </button>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-none text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatSermonDate(sermon)}
                        </span>
                        {sermon.location && (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin size={11} />
                            <span className="truncate">{sermon.location}</span>
                          </span>
                        )}
                      </div>

                      {sermon.lastParagraph ? (
                        <div className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-300">
                          <Clock3 size={11} style={{ color: accentColor }} />
                          <span className="truncate">
                            Continue at paragraph {sermon.lastParagraph}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ModularRecents;
