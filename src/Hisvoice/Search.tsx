import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme.js";
import { formatSermonIntoParagraphs } from "@/utils/sermonUtils";
import CompactSkeleton from "@/components/CompactSkeleton";

// Enhanced paragraph interface for search
interface SearchParagraph {
  id: number;
  content: string;
  originalIndex: number;
  lowerContent: string; // Pre-computed lowercase for faster searching
}

// Preprocessed sermon interface for faster searching
interface ProcessedSermon {
  id: string | number;
  title: string;
  year?: string;
  location?: string;
  type?: string;
  paragraphs: SearchParagraph[];
  sermon: string;
}

// Search result interface
interface SearchMatch {
  sermonId: string | number;
  sermonTitle: string;
  sermonYear?: string;
  sermonLocation?: string;
  sermonType?: string;
  paragraphId: number;
  paragraphContent: string;
  contextBefore: string;
  contextAfter: string;
  matchedText: string;
  fullSermonText: string;
}

// Grouped sermon matches interface
interface GroupedSermonMatch {
  sermonId: string | number;
  sermonTitle: string;
  sermonYear?: string;
  sermonLocation?: string;
  sermonType?: string;
  fullSermonText: string;
  matches: SearchMatch[];
  totalMatches: number;
}

const Search = () => {
  const { navigateToSearchResult, allSermons } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [searchInput, setSearchInput] = useState("");
  const [foundMatches, setFoundMatches] = useState<GroupedSermonMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchIndicator, setShowSearchIndicator] = useState(false);
  const [expandedSermons, setExpandedSermons] = useState<{
    [key: string]: boolean | undefined;
  }>({});

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchCacheRef = useRef<Map<string, GroupedSermonMatch[]>>(new Map());

  // Memoize and preprocess all sermons once for faster searching
  const processedSermons = useMemo<ProcessedSermon[]>(() => {
    // Only process text sermons for search (filter out audio sermons)
    const textSermons = allSermons.filter(
      (sermon) =>
        sermon.type === "text" &&
        sermon.sermon &&
        typeof sermon.sermon === "string"
    );

    return textSermons.map((sermon) => {
      const formattedParagraphs = formatSermonIntoParagraphs(sermon.sermon!);
      const paragraphs: SearchParagraph[] = formattedParagraphs.map(
        (content, index) => ({
          id: index + 1,
          content: content,
          originalIndex: index,
          lowerContent: content.toLowerCase(), // Pre-compute for faster searching
        })
      );

      return {
        id: sermon.id,
        title: sermon.title,
        year: sermon.year,
        location: sermon.location,
        type: sermon.type,
        paragraphs,
        sermon: sermon.sermon!,
      };
    });
  }, [allSermons]); // Depend on allSermons so it updates when sermons are loaded

  // Function to group matches by sermon
  const groupMatchesBySermon = useCallback(
    (matches: SearchMatch[]): GroupedSermonMatch[] => {
      const groupedMap = new Map<string | number, GroupedSermonMatch>();

      matches.forEach((match) => {
        const sermonId = match.sermonId;

        if (groupedMap.has(sermonId)) {
          const existingGroup = groupedMap.get(sermonId)!;
          existingGroup.matches.push(match);
          existingGroup.totalMatches++;
        } else {
          groupedMap.set(sermonId, {
            sermonId: match.sermonId,
            sermonTitle: match.sermonTitle,
            sermonYear: match.sermonYear,
            sermonLocation: match.sermonLocation,
            sermonType: match.sermonType,
            fullSermonText: match.fullSermonText,
            matches: [match],
            totalMatches: 1,
          });
        }
      });

      return Array.from(groupedMap.values());
    },
    []
  );

  // Optimized search function using Web Workers concept (simulated with setTimeout)
  const performOptimizedSearch = useCallback(
    async (searchTerm: string): Promise<GroupedSermonMatch[]> => {
      return new Promise((resolve) => {
        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
          const normalizedTerm = searchTerm.trim().toLowerCase();
          const matches: SearchMatch[] = [];

          // Early exit for very short terms
          if (normalizedTerm.length < 2) {
            resolve([]);
            return;
          }

          // Optimized search - process in chunks to prevent blocking
          const processChunk = (
            sermons: ProcessedSermon[],
            startIndex: number,
            chunkSize: number
          ) => {
            const endIndex = Math.min(startIndex + chunkSize, sermons.length);

            for (let i = startIndex; i < endIndex; i++) {
              const sermon = sermons[i];

              for (const paragraph of sermon.paragraphs) {
                const matchIndex =
                  paragraph.lowerContent.indexOf(normalizedTerm);

                if (matchIndex !== -1) {
                  const beforeContext = paragraph.content.slice(
                    Math.max(0, matchIndex - 100),
                    matchIndex
                  );
                  const afterContext = paragraph.content.slice(
                    matchIndex + searchTerm.length,
                    matchIndex + searchTerm.length + 100
                  );

                  const previewText = paragraph.content.slice(
                    Math.max(0, matchIndex - 30),
                    matchIndex + searchTerm.length + 30
                  );

                  const actualMatchedText = paragraph.content.slice(
                    matchIndex,
                    matchIndex + searchTerm.length
                  );

                  matches.push({
                    sermonId: sermon.id,
                    sermonTitle: sermon.title,
                    sermonYear: sermon.year,
                    sermonLocation: sermon.location,
                    sermonType: sermon.type,
                    paragraphId: paragraph.id,
                    paragraphContent: previewText,
                    contextBefore: beforeContext,
                    contextAfter: afterContext,
                    matchedText: actualMatchedText,
                    fullSermonText: sermon.sermon,
                  });

                  // Limit matches per sermon to prevent overwhelming results
                  if (
                    matches.filter((m) => m.sermonId === sermon.id).length >= 5
                  ) {
                    break;
                  }
                }
              }

              // Limit total results for performance
              if (matches.length >= 100) {
                break;
              }
            }
          };

          // Process sermons in chunks
          processChunk(processedSermons, 0, processedSermons.length);

          // Group matches by sermon before resolving
          const groupedMatches = groupMatchesBySermon(matches);
          resolve(groupedMatches);
        }, 0);
      });
    },
    [processedSermons, groupMatchesBySermon]
  );

  // Debounced search with caching
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmedInput = searchInput.trim();

    if (trimmedInput.length >= 2) {
      // Check cache first
      const cached = searchCacheRef.current.get(trimmedInput.toLowerCase());
      if (cached) {
        setFoundMatches(cached);
        setIsSearching(false);
        setShowSearchIndicator(false);
        return;
      }

      setShowSearchIndicator(true);
      setIsSearching(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const matches = await performOptimizedSearch(trimmedInput);

          // Cache the results
          searchCacheRef.current.set(trimmedInput.toLowerCase(), matches);

          // Limit cache size
          if (searchCacheRef.current.size > 50) {
            const entries = Array.from(searchCacheRef.current.entries());
            const firstKey = entries[0]?.[0];
            if (firstKey) {
              searchCacheRef.current.delete(firstKey);
            }
          }

          setFoundMatches(matches);
        } catch (error) {
          console.error("Search error:", error);
          setFoundMatches([]);
        } finally {
          setIsSearching(false);
          setShowSearchIndicator(false);
        }
      }, 300); // Reduced debounce time for faster response
    } else {
      setFoundMatches([]);
      setIsSearching(false);
      setShowSearchIndicator(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, performOptimizedSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Optimized input handler - no immediate state changes to prevent UI blocking
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
    },
    []
  );

  // Optimized search submit
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const trimmedInput = searchInput.trim();
      if (trimmedInput.length >= 2) {
        // Check cache first for immediate response
        const cached = searchCacheRef.current.get(trimmedInput.toLowerCase());
        if (cached) {
          setFoundMatches(cached);
          setIsSearching(false);
          setShowSearchIndicator(false);
          return;
        }

        setIsSearching(true);
        setShowSearchIndicator(true);
        performOptimizedSearch(trimmedInput)
          .then((matches) => {
            searchCacheRef.current.set(trimmedInput.toLowerCase(), matches);
            setFoundMatches(matches);
            setIsSearching(false);
            setShowSearchIndicator(false);
          })
          .catch((error) => {
            console.error("Search error:", error);
            setFoundMatches([]);
            setIsSearching(false);
            setShowSearchIndicator(false);
          });
      }
    },
    [searchInput, performOptimizedSearch]
  );

  const handleMatchClick = useCallback(
    (match: SearchMatch) => {
      navigateToSearchResult(
        match.sermonId,
        match.paragraphId,
        searchInput.trim()
      );
    },
    [navigateToSearchResult, searchInput]
  );

  const handleSermonGroupClick = useCallback(
    (groupedMatch: GroupedSermonMatch) => {
      // If there's only one match, go directly to it
      if (groupedMatch.totalMatches === 1) {
        const match = groupedMatch.matches[0];
        navigateToSearchResult(
          match.sermonId,
          match.paragraphId,
          searchInput.trim()
        );
      } else {
        // Toggle the expansion of sermon matches
        setExpandedSermons((prev) => ({
          ...prev,
          [groupedMatch.sermonId]: !prev[groupedMatch.sermonId],
        }));
      }
    },
    [navigateToSearchResult, searchInput]
  );

  // Optimized highlight function with memoization
  const highlightSearchTerm = useCallback((text: string, term: string) => {
    if (!term.trim()) return text;

    const searchTerm = term.trim();
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);

    if (index !== -1) {
      const before = text.slice(0, index);
      const match = text.slice(index, index + searchTerm.length);
      const after = text.slice(index + searchTerm.length);
      return `${before}<span class='bg-amber-200 dark:bg-amber-900/50 px-1 text-amber-900 dark:text-amber-200 rounded font-medium'>${match}</span>${after}`;
    }

    return text;
  }, []);

  return (
    <div className=" h-full relativ flex flex-col bg-gray-100 dark:bg-primary/50 p-4 rounded-[20px] font-zilla">
      {/* Fixed Header */}
      <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold font-serif mb-3 text-stone-700 dark:text-gray-50">
          Advanced Search
        </h2>

        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for quotes, phrases, or keywords..."
                className="w-full p-3 pr-10 text-sm bg-gray-50 dark:bg-primary border-none border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-700 text-stone-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onChange={handleSearchInput}
                value={searchInput}
              />
              {showSearchIndicator && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-stone-600 border-t-transparent"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-3 bg-stone-600 dark:bg-primary hover:bg-stone-700 dark:hover:bg-gray-500 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <SearchOutlined className="mr-1" />
                  Search
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Tips:</span> Search supports fuzzy
            matching, punctuation variations, and partial phrases.
            {searchInput.length > 0 && searchInput.length < 2 && (
              <span className="text-orange-500 dark:text-orange-400 ml-2">
                Enter at least 2 characters to search
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Scrollable Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isSearching ? (
          <div className="p-4">
            <div className="mb-4">
              <CompactSkeleton lines={1} width="medium" height="small" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-600 pb-4"
                >
                  <div className="mb-2">
                    <CompactSkeleton lines={1} width="large" height="medium" />
                  </div>
                  <CompactSkeleton lines={3} width="full" height="small" />
                  <div className="mt-2">
                    <CompactSkeleton lines={1} width="small" height="small" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : foundMatches.length > 0 ? (
          <div className="p-2">
            <div className="text-xs text-stone-600 dark:text-gray-400 mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
              Found{" "}
              {foundMatches.reduce(
                (total, group) => total + group.totalMatches,
                0
              )}{" "}
              match
              {foundMatches.reduce(
                (total, group) => total + group.totalMatches,
                0
              ) !== 1
                ? "es"
                : ""}{" "}
              in {foundMatches.length} sermon
              {foundMatches.length !== 1 ? "s" : ""} for "{searchInput.trim()}"
            </div>

            <div className="space-y-0">
              {foundMatches.map((groupedMatch, index) => {
                const sermonId = groupedMatch.sermonId;
                const isExpanded = expandedSermons[sermonId];
                const displayMatches =
                  groupedMatch.totalMatches === 1 || isExpanded
                    ? groupedMatch.matches
                    : [groupedMatch.matches[0]]; // Show only first match when collapsed

                return (
                  <div key={`sermon-${sermonId}-${index}`}>
                    {/* Sermon Header */}
                    <div
                      className="py-1.5 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-primary/20 transition-colors border-b border-gray-100 dark:border-gray-700"
                      onClick={() => handleSermonGroupClick(groupedMatch)}
                    >
                      <div className="flex justify-between items-center">
                        <h1 className="font-medium text-stone-700 dark:text-orange-100 text-sm leading-tight italic  truncate">
                          {groupedMatch.sermonTitle}
                        </h1>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {groupedMatch.sermonYear && (
                            <span>{groupedMatch.sermonYear}</span>
                          )}

                          <span className="bg-yellow-900 dark:bg-yellow-900 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                            {groupedMatch.totalMatches}
                          </span>
                          {groupedMatch.totalMatches > 1 && (
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Individual Matches */}
                    <div>
                      {displayMatches.map((match, matchIndex) => {
                        const uniqueMatchId = `${match.sermonId}-${match.paragraphId}-${matchIndex}`;

                        return (
                          <div
                            key={uniqueMatchId}
                            className="py-2 px-3 cursor-pointer border-solid hover:bg-gray-50 dark:hover:bg-orange-300/10 transition-colors border-x-0 border-t-0 border-b  border-stone-200 dark:border-text/20"
                            onClick={() => handleMatchClick(match)}
                          >
                            <div className="text-sm leading-relaxed">
                              <span className="text-stone-600 dark:text-text">
                                <span className=" text-yellow-800 dark:text-orange-500 px-1.5 py-0.5 rounded text-xs font-mono flex-shrink-0">
                                  ¶{match.paragraphId}
                                </span>

                                {match.contextBefore}
                              </span>

                              <span className="bg-yellow-700 dark:bg-transparent px-1 text-white dark:text-yellow-700 rounded font-medium">
                                {match.matchedText}
                              </span>
                              <span className="text-stone-600 dark:text-text">
                                {match.contextAfter}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <img
                src="./nosong.png"
                alt="No results"
                className="h-32 mx-auto mb-4 opacity-60"
              />
              <p className="text-stone-600 dark:text-gray-300 font-serif italic text-sm max-w-xs mb-4">
                Search for quotes across all sermons preached by Robert Lambert
                Lee
              </p>
              {searchInput && foundMatches.length === 0 && !isSearching && (
                <div className="text-stone-500 dark:text-gray-400 text-sm">
                  <p className="mb-2">No results found for "{searchInput}"</p>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    <p>Try:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Different keywords or phrases</li>
                      <li>Partial words or simpler terms</li>
                      <li>Common biblical themes or concepts</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
