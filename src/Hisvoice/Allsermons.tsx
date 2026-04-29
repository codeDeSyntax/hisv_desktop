import { useContext, useState, useMemo, useCallback, memo } from "react";
import { Tooltip } from "antd";
import { CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Mic2, Search as SearchIcon } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons.js";
import { Sermon } from "@/types/index.js";
import { useTheme } from "@/Provider/Theme.js";
import SermonLoadSkeleton from "@/components/SermonLoadSkeleton";
import SermonRow from "./SermonRow";

const SermonList = memo(
  ({ onSermonSelect }: { onSermonSelect?: () => void }) => {
    const {
      allSermons,
      loading,
      error,
      setActiveTab,
      setSelectedMessage,
      setRecentSermons,
    } = useSermonContext();

    const [searchText, setSearchText] = useState("");
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [sermonTypeFilter, setSermonTypeFilter] = useState<
      "all" | "audio" | "text"
    >("all");
    const { isDarkMode } = useTheme();

    const filteredSermons = useMemo(() => {
      let filtered = allSermons;

      // Filter by sermon type
      if (sermonTypeFilter !== "all") {
        filtered = filtered.filter((sermon) => {
          if (sermonTypeFilter === "audio") {
            return sermon.type === "mp3";
          } else if (sermonTypeFilter === "text") {
            return sermon.type !== "mp3";
          }
          return true;
        });
      }

      // Filter by search text
      const q = searchText.trim().toLowerCase();
      if (!q) return filtered;
      return filtered.filter(
        (sermon) =>
          sermon.title.toString().toLowerCase().includes(q) ||
          (sermon.year ?? "").toString().includes(q),
      );
    }, [allSermons, searchText, sermonTypeFilter]);

    const sortedSermons = useMemo(() => {
      let sorted = [...filteredSermons];

      if (sortField) {
        sorted.sort((a, b) => {
          let aValue: string | number = "";
          let bValue: string | number = "";

          if (sortField === "title") {
            aValue = a.title;
            bValue = b.title;
          } else if (sortField === "year") {
            aValue = Number(a.year) || 0;
            bValue = Number(b.year) || 0;
          }

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortOrder === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else {
            return sortOrder === "asc"
              ? (aValue as number) - (bValue as number)
              : (bValue as number) - (aValue as number);
          }
        });
      } else {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      }

      return sorted;
    }, [filteredSermons, sortField, sortOrder]);

    const handleSearch = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
      },
      [],
    );

    const handleSort = useCallback(
      (field: string) => {
        if (sortField === field) {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
          setSortField(field);
          setSortOrder("asc");
        }
      },
      [sortField, sortOrder],
    );

    const handleSermonClick = useCallback(
      (sermon: Sermon) => {
        setSelectedMessage(sermon);
        setActiveTab("message");

        const recentSermons = JSON.parse(
          localStorage.getItem("recentSermons") || "[]",
        );
        const updatedRecentSermons = recentSermons.filter(
          (item: Sermon) => item.id !== sermon.id,
        );
        updatedRecentSermons.unshift(sermon);
        const limitedRecentSermons = updatedRecentSermons.slice(0, 4);
        localStorage.setItem(
          "recentSermons",
          JSON.stringify(limitedRecentSermons),
        );
        setRecentSermons(limitedRecentSermons);

        // Close sidebar after selection
        onSermonSelect?.();
      },
      [setSelectedMessage, setActiveTab, setRecentSermons, onSermonSelect],
    );

    if (loading) {
      return (
        <div className="h-full w-full max-w-2xl m-auto flex flex-col">
          <SermonLoadSkeleton count={10} showSearch={true} showHeader={true} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full  flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      );
    }

    return (
      <div className="h-full w-full max-w-2xl m-auto flex flex-col ">
        {/* Search and filter header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                placeholder="Filter by title or year…"
                onChange={handleSearch}
                className="w-full pl-8 pr-4 py-2 text-[13px] bg-zinc-100 dark:bg-zinc-900 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
                spellCheck={false}
              />
            </div>

            {/* Type filter buttons - segmented control style */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0">
              {["all", "audio", "text"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSermonTypeFilter(type as "all" | "audio" | "text")
                  }
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                    sermonTypeFilter === type
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {type === "all" ? "All" : type === "audio" ? "🎙️" : "📄"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="flex-shrink-0 flex items-center px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/60 select-none">
          <button
            onClick={() => handleSort("title")}
            className="flex flex-1 bg-transparent items-center gap-1 text-left text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Title
            {sortField === "title" && (
              <span className="ml-0.5">{sortOrder === "asc" ? "↑" : "↓"}</span>
            )}
          </button>
          <button
            onClick={() => handleSort("year")}
            className="w-14 flex items-center gap-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Year
            {sortField === "year" && (
              <span className="ml-0.5">{sortOrder === "asc" ? "↑" : "↓"}</span>
            )}
          </button>
          <div className="w-10 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Type
          </div>
        </div>

        {/* Scrollable rows */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {error ? (
            <div className="flex items-center justify-center h-32">
              <span className="text-sm text-red-500 dark:text-red-400">
                Error loading sermons
              </span>
            </div>
          ) : (
            sortedSermons.map((sermon, id) => (
              <SermonRow
                key={sermon.id}
                sermon={sermon}
                onRowClick={handleSermonClick}
                id={id}
              />
            ))
          )}
        </div>

        {/* Footer row count */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-zinc-50 dark:border-zinc-900/80">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
            {sortedSermons.length.toLocaleString()} sermon
            {sortedSermons.length !== 1 ? "s" : ""}
            {searchText && ` matching "${searchText}"`}
            {sermonTypeFilter !== "all" && ` (${sermonTypeFilter})`}
          </span>
        </div>
      </div>
    );
  },
);

export default SermonList;
