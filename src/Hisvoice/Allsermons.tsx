import { useContext, useState, useMemo, useCallback, memo } from "react";
import { Tooltip } from "antd";
import { CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Mic2, Search as SearchIcon } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons.js";
import { Sermon } from "@/types/index.js";
import { useTheme } from "@/Provider/Theme.js";
import SermonLoadSkeleton from "@/components/SermonLoadSkeleton";
import SermonRow from "./SermonRow";

const SermonList = memo(() => {
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
  const { isDarkMode } = useTheme();

  const filteredSermons = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return allSermons;
    return allSermons.filter(
      (sermon) =>
        sermon.title.toString().toLowerCase().includes(q) ||
        (sermon.year ?? "").toString().includes(q),
    );
  }, [allSermons, searchText]);

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

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

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
    },
    [setSelectedMessage, setActiveTab, setRecentSermons],
  );

  if (loading) {
    return (
      <SermonLoadSkeleton count={10} showSearch={true} showHeader={true} />
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white dark:bg-background flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-stone-950">
      {/* Search header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800/80">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
          <input
            placeholder="Filter by title or year…"
            onChange={handleSearch}
            className="w-full pl-8 pr-4 py-2 text-[13px] bg-stone-100 dark:bg-stone-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex-shrink-0 flex items-center px-4 py-2 border-b border-stone-100 dark:border-stone-800/60 select-none">
        <button
          onClick={() => handleSort("title")}
          className="flex flex-1 bg-transparent items-center gap-1 text-left text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest hover:text-stone-600 dark:hover:text-stone-300"
        >
          Title
          {sortField === "title" && (
            <span className="ml-0.5">{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
        <button
          onClick={() => handleSort("year")}
          className="w-14 flex items-center gap-1 text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest hover:text-stone-600 dark:hover:text-stone-300"
        >
          Year
          {sortField === "year" && (
            <span className="ml-0.5">{sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
        <div className="w-10 text-center text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
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
      <div className="flex-shrink-0 px-4 py-2 border-t border-stone-50 dark:border-stone-900/80">
        <span className="text-[11px] text-stone-400 dark:text-stone-600">
          {sortedSermons.length.toLocaleString()} sermon
          {sortedSermons.length !== 1 ? "s" : ""}
          {searchText && ` matching "${searchText}"`}
        </span>
      </div>
    </div>
  );
});

export default SermonList;
