import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme.js";
import CompactSkeleton from "@/components/CompactSkeleton";

// â”€â”€ types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FTSRow {
  id: string;
  title: string;
  year: string | null;
  location: string | null;
  type: string | null;
  snippet: string; // text with <mark>â€¦</mark> around matched terms
}

interface GroupedSermonMatch {
  sermonId: string;
  sermonTitle: string;
  sermonYear?: string;
  sermonLocation?: string;
  snippets: string[];
  totalMatches: number;
}

type SearchMode = "all" | "exact";

interface PersistedSearchViewState {
  searchInput: string;
  executedSearchTerm: string;
  foundMatches: GroupedSermonMatch[];
  searchMode: SearchMode;
  expandedSermons: Record<string, boolean>;
  selectedSermonFilter: string | null;
  showSermonDropdown: boolean;
}

let persistedSearchViewState: PersistedSearchViewState | null = null;

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Parse a FTS5 snippet that contains <mark>â€¦</mark> tags and render it as
 * React elements. No dangerouslySetInnerHTML required â€” the content is data
 * from our own controlled database.
 */
function normalizeSnippetMarkup(rawSnippet: string): string {
  return rawSnippet
    .replace(/&lt;\s*mark\s*\/?\s*&gt;/gi, "")
    .replace(/&lt;\s*\/\s*mark\s*&gt;/gi, "")
    .replace(/<\s*mark\s*\/\s*>/gi, "")
    .replace(/<\s*mark\b[^>]*>/gi, "<mark>")
    .replace(/<\s*\/\s*mark\s*>/gi, "</mark>");
}

function RenderSnippet({
  snippet,
  accentColor,
}: {
  snippet: string;
  accentColor: string;
}) {
  const normalizedSnippet = normalizeSnippetMarkup(snippet);
  const parts = normalizedSnippet.split(/(<mark>.*?<\/mark>)/gi);
  return (
    <>
      {parts.map((part, i) => {
        if (/^<mark>.*<\/mark>$/i.test(part)) {
          const inner = part.replace(/^<mark>/i, "").replace(/<\/mark>$/i, "");
          return (
            <span
              key={i}
              className="px-0.5 rounded font-semibold text-[12px]"
              style={{
                backgroundColor: accentColor + "25",
                color: accentColor,
              }}
            >
              {inner}
            </span>
          );
        }
        const plainPart = part.replace(/<\/?\s*mark\b[^>]*>/gi, "");
        return (
          <span
            key={i}
            className="text-zinc-600 dark:text-zinc-400 text-[12px]"
          >
            {plainPart}
          </span>
        );
      })}
    </>
  );
}

function groupFTSResults(rows: FTSRow[]): GroupedSermonMatch[] {
  const map = new Map<string, GroupedSermonMatch>();
  for (const row of rows) {
    const existing = map.get(row.id);
    if (existing) {
      if (!existing.snippets.includes(row.snippet)) {
        existing.snippets.push(row.snippet);
      }
      existing.totalMatches++;
    } else {
      map.set(row.id, {
        sermonId: row.id,
        sermonTitle: row.title,
        sermonYear: row.year ?? undefined,
        sermonLocation: row.location ?? undefined,
        snippets: [row.snippet],
        totalMatches: 1,
      });
    }
  }
  return Array.from(map.values());
}

// â”€â”€ component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Search = ({ onSelect }: { onSelect?: () => void }) => {
  const { navigateToSearchResult } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();
  const [searchInput, setSearchInput] = useState(
    () => persistedSearchViewState?.searchInput ?? "",
  );
  const [executedSearchTerm, setExecutedSearchTerm] = useState(
    () => persistedSearchViewState?.executedSearchTerm ?? "",
  );
  const [foundMatches, setFoundMatches] = useState<GroupedSermonMatch[]>(
    () => persistedSearchViewState?.foundMatches ?? [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>(
    () => persistedSearchViewState?.searchMode ?? "all",
  );
  const [expandedSermons, setExpandedSermons] = useState<
    Record<string, boolean>
  >(() => persistedSearchViewState?.expandedSermons ?? {});
  const [selectedSermonFilter, setSelectedSermonFilter] = useState<
    string | null
  >(() => persistedSearchViewState?.selectedSermonFilter ?? null);
  const [showSermonDropdown, setShowSermonDropdown] = useState<boolean>(
    () => persistedSearchViewState?.showSermonDropdown ?? false,
  );

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, GroupedSermonMatch[]>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    persistedSearchViewState = {
      searchInput,
      executedSearchTerm,
      foundMatches,
      searchMode,
      expandedSermons,
      selectedSermonFilter,
      showSermonDropdown,
    };
  }, [
    searchInput,
    executedSearchTerm,
    foundMatches,
    searchMode,
    expandedSermons,
    selectedSermonFilter,
    showSermonDropdown,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSermonDropdown(false);
      }
    };

    if (showSermonDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSermonDropdown]);

  // â”€â”€ search via FTS5 IPC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const doSearch = useCallback(async (term: string, mode: SearchMode) => {
    const normalizedTerm = term.trim().replace(/\s+/g, " ");
    const key = `${mode}:${normalizedTerm.toLowerCase()}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setFoundMatches(cached);
      return;
    }

    setIsSearching(true);
    try {
      const rows: FTSRow[] = await window.ipcRenderer.invoke("db:search", {
        query: normalizedTerm,
        mode,
      });
      const grouped = groupFTSResults(rows);

      // cap cache at 50 entries
      if (cacheRef.current.size >= 50) {
        const first = cacheRef.current.keys().next().value;
        if (first) cacheRef.current.delete(first);
      }
      cacheRef.current.set(key, grouped);
      setFoundMatches(grouped);
    } catch (err) {
      console.error("Search error:", err);
      setFoundMatches([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Clear results when input is too short, but don't auto-search
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setFoundMatches([]);
      setIsSearching(false);
    }

    // Clear any pending timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, [searchInput]);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value),
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = searchInput.trim();
        if (trimmed.length >= 2) {
          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
          setExecutedSearchTerm(trimmed);
          doSearch(trimmed, searchMode);
        }
      }
    },
    [searchInput, doSearch, searchMode],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = searchInput.trim();
      if (trimmed.length >= 2) {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setExecutedSearchTerm(trimmed);
        doSearch(trimmed, searchMode);
      }
    },
    [searchInput, doSearch, searchMode],
  );

  const handleSermonClick = useCallback(
    (group: GroupedSermonMatch) => {
      // Open the sermon; in-sermon search will highlight the term
      const termForNavigation = executedSearchTerm || searchInput.trim();
      if (!termForNavigation) return;
      navigateToSearchResult(group.sermonId, 1, termForNavigation);

      // Close sidebar after selection
      onSelect?.();
    },
    [navigateToSearchResult, executedSearchTerm, searchInput, onSelect],
  );

  const toggleExpand = useCallback((sermonId: string) => {
    setExpandedSermons((prev) => ({ ...prev, [sermonId]: !prev[sermonId] }));
  }, []);

  // Filter matches based on selected sermon
  const displayedMatches = selectedSermonFilter
    ? foundMatches.filter((m) => m.sermonId === selectedSermonFilter)
    : foundMatches;

  const totalMatches = foundMatches.reduce((t, g) => t + g.totalMatches, 0);
  const displayedTotalMatches = displayedMatches.reduce(
    (t, g) => t + g.totalMatches,
    0,
  );

  return (
    <div className="h-full w-full max-w-2xl m-auto flex flex-col bg-white dark:bg-zinc-950 font-zilla">
      {/* Search header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 overflow-visible">
        <form onSubmit={handleSearchSubmit} className="overflow-visible">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search quotes, phrases, keywords… (Press Enter to search)"
                className="w-full pl-4 pr-10 py-2.5 text-[13px] bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-150"
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                value={searchInput}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-[1.5px] border-zinc-400 border-t-transparent" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 text-white text-[13px] font-medium rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentColor }}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-[1.5px] border-white border-t-transparent" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 relative">
            <button
              type="button"
              onClick={() => setSearchMode("all")}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                searchMode === "all"
                  ? "text-white border-transparent"
                  : "text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
              }`}
              style={
                searchMode === "all"
                  ? { backgroundColor: accentColor }
                  : undefined
              }
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("exact")}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                searchMode === "exact"
                  ? "text-white border-transparent"
                  : "text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
              }`}
              style={
                searchMode === "exact"
                  ? { backgroundColor: accentColor }
                  : undefined
              }
            >
              Exact match
            </button>
          </div>
          {/* Sermon filter dropdown */}
          {foundMatches.length > 0 && (
            <div
              className="relative ml-auto w-full bg-zinc-100 dark:bg-zinc-900 rounded-full"
              ref={dropdownRef}
            >
              <button
                type="button"
                onClick={() => setShowSermonDropdown(!showSermonDropdown)}
                className="flex items-center gap-1 px-2.5 mt-2 p-2  text-[11px] rounded-full border text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-full"
              >
                <span className="text-[10px]">
                  {selectedSermonFilter
                    ? "Filter: " +
                      foundMatches
                        .find((m) => m.sermonId === selectedSermonFilter)
                        ?.sermonTitle.split(" ")[0] +
                      "..."
                    : "Filter sermons"}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${
                    showSermonDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {showSermonDropdown && (
                <div className="absolute left-0 h-[33rem]  mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 py-2 overflow-y-auto no-scrollbar w-full ">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSermonFilter(null);
                      setShowSermonDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                      selectedSermonFilter === null
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    All sermons ({foundMatches.length})
                  </button>

                  <div className="border-t border-zinc-200 dark:border-zinc-700  ">
                    {foundMatches.map((sermon) => (
                      <button
                        key={sermon.sermonId}
                        type="button"
                        onClick={() => {
                          setSelectedSermonFilter(sermon.sermonId);
                          setShowSermonDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[12px] transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 ${
                          selectedSermonFilter === sermon.sermonId
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex-1">{sermon.sermonTitle}</span>
                          <span
                            className="text-white px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ml-2"
                            style={{ backgroundColor: accentColor }}
                          >
                            {sermon.totalMatches}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {searchInput.length > 0 && searchInput.length < 2 && (
            <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
              Enter at least 2 characters, then press Enter or click Search
            </p>
          )}
        </form>
      </div>

      {/* Scrollable results */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isSearching ? (
          <div className="p-3">
            <div className="mb-3">
              <CompactSkeleton lines={1} width="medium" height="small" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-b border-zinc-100 dark:border-zinc-800 pb-3"
                >
                  <div className="mb-2">
                    <CompactSkeleton lines={1} width="large" height="medium" />
                  </div>
                  <CompactSkeleton lines={2} width="full" height="small" />
                </div>
              ))}
            </div>
          </div>
        ) : foundMatches.length > 0 ? (
          <div className="p-2">
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {displayedTotalMatches}
                </span>{" "}
                match{displayedTotalMatches !== 1 ? "es" : ""} in{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {displayedMatches.length}
                </span>{" "}
                sermon{displayedMatches.length !== 1 ? "s" : ""} for "
                {searchInput.trim()}" (
                {searchMode === "exact" ? "Exact" : "All"})
              </p>
            </div>

            <div className="px-2 py-1 space-y-1">
              {displayedMatches.map((group) => {
                const isExpanded = expandedSermons[group.sermonId];
                const shown = isExpanded
                  ? group.snippets
                  : group.snippets.slice(0, 1);

                return (
                  <div
                    key={group.sermonId}
                    className="rounded-lg border-x-0 border-t-0 border border-solid border-zinc-100 dark:border-zinc-800/60 overflow-hidden"
                  >
                    {shown.map((snippet, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 px-3 cursor-pointer  transition-colors duration-100 border-b border-zinc-100 dark:border-zinc-800/60 last:border-b-0"
                        onClick={() => handleSermonClick(group)}
                      >
                        <div className="flex items-start gap-2">
                          {/* Badge column */}
                          <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                            <span
                              className="text-white px-1 py-px rounded text-[9px] font-semibold leading-tight"
                              style={{ backgroundColor: accentColor }}
                            >
                              {group.totalMatches}
                            </span>
                            {group.totalMatches > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(group.sermonId);
                                }}
                                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded transition-colors"
                              >
                                <ChevronDown
                                  size={10}
                                  className={`transition-transform text-zinc-600 dark:text-zinc-400 ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Content column */}
                          <div className="text-[12px] leading-normal flex-1 min-w-0">
                            {idx === 0 && (
                              <div className="mb-0.5">
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[14px] line-clamp-1">
                                  {group.sermonTitle}
                                </span>
                                {(group.sermonYear || group.sermonLocation) && (
                                  <span className="font-medium text-zinc-500 dark:text-zinc-400 text-[12px] ml-1.5">
                                    {group.sermonLocation}
                                    {group.sermonYear
                                      ? ` ${group.sermonYear}`
                                      : ""}
                                  </span>
                                )}
                              </div>
                            )}
                            <RenderSnippet
                              snippet={snippet}
                              accentColor={accentColor}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <img
              src="./nosong.png"
              alt="No results"
              className="h-24 mb-4 opacity-40"
            />
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-serif italic max-w-xs leading-relaxed mb-3">
              Search for quotes across all sermons
            </p>
            {searchInput && foundMatches.length === 0 && !isSearching && (
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                  No results for "{searchInput}"
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Try shorter phrases or different keywords
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
