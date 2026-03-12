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

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Parse a FTS5 snippet that contains <mark>â€¦</mark> tags and render it as
 * React elements. No dangerouslySetInnerHTML required â€” the content is data
 * from our own controlled database.
 */
function RenderSnippet({
  snippet,
  accentColor,
}: {
  snippet: string;
  accentColor: string;
}) {
  const parts = snippet.split(/(<mark>.*?<\/mark>)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("<mark>") && part.endsWith("</mark>")) {
          const inner = part.slice(6, -7);
          return (
            <span
              key={i}
              className="px-0.5 rounded font-semibold"
              style={{
                backgroundColor: accentColor + "25",
                color: accentColor,
              }}
            >
              {inner}
            </span>
          );
        }
        return (
          <span key={i} className="text-stone-600 dark:text-stone-400">
            {part}
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
      existing.snippets.push(row.snippet);
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
const Search = () => {
  const { navigateToSearchResult } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();
  const [searchInput, setSearchInput] = useState("");
  const [foundMatches, setFoundMatches] = useState<GroupedSermonMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSermons, setExpandedSermons] = useState<
    Record<string, boolean>
  >({});

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, GroupedSermonMatch[]>>(new Map());

  // â”€â”€ search via FTS5 IPC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const doSearch = useCallback(async (term: string) => {
    const key = term.toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached) {
      setFoundMatches(cached);
      return;
    }

    setIsSearching(true);
    try {
      const rows: FTSRow[] = await window.ipcRenderer.invoke("db:search", term);
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

  // Debounced search on input change
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setFoundMatches([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => doSearch(trimmed), 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchInput, doSearch]);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value),
    [],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = searchInput.trim();
      if (trimmed.length >= 2) {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        doSearch(trimmed);
      }
    },
    [searchInput, doSearch],
  );

  const handleSermonClick = useCallback(
    (group: GroupedSermonMatch) => {
      // Open the sermon; in-sermon search will highlight the term
      navigateToSearchResult(group.sermonId, 1, searchInput.trim());
    },
    [navigateToSearchResult, searchInput],
  );

  const toggleExpand = useCallback((sermonId: string) => {
    setExpandedSermons((prev) => ({ ...prev, [sermonId]: !prev[sermonId] }));
  }, []);

  const totalMatches = foundMatches.reduce((t, g) => t + g.totalMatches, 0);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stone-950 font-zilla">
      {/* Search header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800/80">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search quotes, phrases, keywordsâ€¦"
                className="w-full pl-4 pr-10 py-2.5 text-[13px] bg-stone-100 dark:bg-stone-900 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 transition-all"
                onChange={handleSearchInput}
                value={searchInput}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-[1.5px] border-stone-400 border-t-transparent" />
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
          {searchInput.length > 0 && searchInput.length < 2 && (
            <p className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
              Enter at least 2 characters
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
                  className="border-b border-stone-100 dark:border-stone-800 pb-3"
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
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-stone-700 dark:text-stone-200">
                  {totalMatches}
                </span>{" "}
                match{totalMatches !== 1 ? "es" : ""} in{" "}
                <span className="font-semibold text-stone-700 dark:text-stone-200">
                  {foundMatches.length}
                </span>{" "}
                sermon{foundMatches.length !== 1 ? "s" : ""} for "
                {searchInput.trim()}"
              </p>
            </div>

            <div className="px-2 py-2 space-y-2">
              {foundMatches.map((group) => {
                const isExpanded = expandedSermons[group.sermonId];
                const shown = isExpanded
                  ? group.snippets
                  : group.snippets.slice(0, 1);

                return (
                  <div
                    key={group.sermonId}
                    className="bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-100 dark:border-stone-800/60 overflow-hidden"
                  >
                    {shown.map((snippet, idx) => (
                      <div
                        key={idx}
                        className="py-3 px-4 cursor-pointer hover:bg-white dark:hover:bg-stone-800/40 transition-colors duration-100 border-b border-stone-100 dark:border-stone-800/60 last:border-b-0"
                        onClick={() => handleSermonClick(group)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Badge column */}
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <span
                              className="text-white px-1.5 py-0.5 rounded text-[10px] font-semibold"
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
                                className="p-0.5 hover:bg-stone-200 dark:hover:bg-stone-600 rounded transition-colors"
                              >
                                <ChevronDown
                                  size={12}
                                  className={`transition-transform text-stone-600 dark:text-stone-400 ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Content column */}
                          <div className="text-sm leading-relaxed flex-1">
                            {idx === 0 && (
                              <div className="mb-1.5">
                                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                  {group.sermonTitle}
                                </span>
                                {(group.sermonYear || group.sermonLocation) && (
                                  <span className="font-semibold text-stone-700 dark:text-stone-300 text-xs ml-2">
                                    [{group.sermonLocation}
                                    {group.sermonYear
                                      ? `, ${group.sermonYear}`
                                      : ""}
                                    ]
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
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-serif italic max-w-xs leading-relaxed mb-3">
              Search for quotes across all sermons
            </p>
            {searchInput && foundMatches.length === 0 && !isSearching && (
              <div className="text-center">
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2">
                  No results for "{searchInput}"
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
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
