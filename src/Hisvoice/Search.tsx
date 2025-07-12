import { useContext, useState, useMemo, useEffect, useRef } from "react";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ChevronDown, ChevronUp } from "lucide-react";
import earlySermons from "../sermons/1964-1969/firstset.js";
import secondSet from "../sermons/1970/1970";
import thirdSet from "../sermons/1971/1971";
import fourthSet from "../sermons/1972/1972";
import lastSet from "../sermons/1973/1973";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme.js";
import { formatSermonIntoParagraphs } from "@/utils/sermonUtils";

// Enhanced paragraph interface for search
interface SearchParagraph {
  id: number;
  content: string;
  originalIndex: number;
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

const Search = () => {
  const { navigateToSearchResult } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [searchInput, setSearchInput] = useState("");
  const [foundMatches, setFoundMatches] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchIndicator, setShowSearchIndicator] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState<{
    [key: string]: boolean | undefined;
  }>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const availableSermons = [
    ...earlySermons,
    ...secondSet,
    ...thirdSet,
    ...fourthSet,
    ...lastSet,
  ];

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }

    if (searchInput.trim() && searchInput.trim().length >= 2) {
      // Show search indicator after a short delay to avoid flickering
      indicatorTimeoutRef.current = setTimeout(() => {
        setShowSearchIndicator(true);
      }, 200);

      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(true);
        performAdvancedSearch();
      }, 500); // 500ms debounce for better UX
    } else {
      setFoundMatches([]);
      setIsSearching(false);
      setShowSearchIndicator(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, []);

  // Function to split sermon into paragraphs using mobile app's logic
  const createParagraphsFromSermon = (
    sermonText: string
  ): SearchParagraph[] => {
    if (!sermonText) return [];

    // Use the same formatting logic as mobile app
    const formattedParagraphs = formatSermonIntoParagraphs(sermonText);

    // Convert to SearchParagraph format for compatibility
    return formattedParagraphs.map((content, index) => ({
      id: index + 1,
      content: content,
      originalIndex: index,
    }));
  };

  // Enhanced search function with better pattern matching
  const createSearchPatterns = (searchTerm: string) => {
    // Normalize the search term
    const normalized = searchTerm
      .trim()
      .toLowerCase()
      // Remove extra spaces
      .replace(/\s+/g, " ")
      // Normalize quotes
      .replace(/[""'']/g, '"')
      // Normalize apostrophes
      .replace(/['']/g, "'");

    // Create multiple search patterns for better matching
    const patterns = [
      // Simple case-insensitive match (highest priority) - this will catch "and"
      normalized,
      // Without punctuation for fuzzy matching
      normalized.replace(/[.,;:!?()[\]{}'"]/g, ""),
      // With flexible spacing
      normalized.replace(/\s+/g, "\\s+"),
    ];

    return patterns.map((pattern) => {
      try {
        // Escape special regex characters for safety, but keep it simple
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(escapedPattern, "gi");
      } catch (e) {
        // Fallback to simple escaped version
        return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      }
    });
  };

  const performAdvancedSearch = async () => {
    if (!searchInput.trim() || searchInput.trim().length < 2) {
      setFoundMatches([]);
      setIsSearching(false);
      return;
    }

    // Don't set isSearching here - it's handled by the debounced effect

    // Add small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    const searchMatches: SearchMatch[] = [];
    const searchTerm = searchInput.trim().toLowerCase();

    availableSermons.forEach((sermon) => {
      const paragraphList = createParagraphsFromSermon(sermon.sermon);

      paragraphList.forEach((para) => {
        // First try simple case-insensitive search for basic words
        const simpleMatch = para.content.toLowerCase().includes(searchTerm);

        if (simpleMatch) {
          // Find the actual match position for highlighting
          const lowerContent = para.content.toLowerCase();
          const matchIndex = lowerContent.indexOf(searchTerm);

          if (matchIndex !== -1) {
            const beforeContext = para.content.slice(
              Math.max(0, matchIndex - 150),
              matchIndex
            );
            const afterContext = para.content.slice(
              matchIndex + searchTerm.length,
              matchIndex + searchTerm.length + 150
            );

            const previewText = para.content.slice(
              Math.max(0, matchIndex - 40),
              matchIndex + searchTerm.length + 40
            );

            // Get the actual matched text from the original content
            const actualMatchedText = para.content.slice(
              matchIndex,
              matchIndex + searchTerm.length
            );

            searchMatches.push({
              sermonId: sermon.id,
              sermonTitle: sermon.title,
              sermonYear: sermon.year,
              sermonLocation: sermon.location,
              sermonType: sermon.type,
              paragraphId: para.id,
              paragraphContent: previewText,
              contextBefore: beforeContext,
              contextAfter: afterContext,
              matchedText: actualMatchedText,
              fullSermonText: sermon.sermon,
            });
            return; // Found a match, move to next paragraph
          }
        }

        // If simple search didn't work, try pattern matching for more complex searches
        const searchPatterns = createSearchPatterns(searchInput.trim());
        for (let i = 0; i < searchPatterns.length; i++) {
          const pattern = searchPatterns[i];
          const matchResult = para.content.match(pattern);

          if (matchResult && matchResult.index !== undefined) {
            const beforeContext = para.content.slice(
              Math.max(0, matchResult.index - 150),
              matchResult.index
            );
            const afterContext = para.content.slice(
              matchResult.index + matchResult[0].length,
              matchResult.index + matchResult[0].length + 150
            );

            const previewText = para.content.slice(
              Math.max(0, matchResult.index - 40),
              matchResult.index + matchResult[0].length + 40
            );

            searchMatches.push({
              sermonId: sermon.id,
              sermonTitle: sermon.title,
              sermonYear: sermon.year,
              sermonLocation: sermon.location,
              sermonType: sermon.type,
              paragraphId: para.id,
              paragraphContent: previewText,
              contextBefore: beforeContext,
              contextAfter: afterContext,
              matchedText: matchResult[0],
              fullSermonText: sermon.sermon,
            });
            break; // Found a match, no need to try other patterns
          }
        }
      });
    });

    setFoundMatches(searchMatches);
    setExpandedMatches({});
    setIsSearching(false);
    setShowSearchIndicator(false);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // Don't set loading state immediately - let the debounced effect handle it
    // This prevents the input from being disabled while typing
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear timeout and search immediately
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchInput.trim() && searchInput.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchIndicator(true);
      performAdvancedSearch();
    }
  };

  const handleMatchClick = (match: SearchMatch) => {
    navigateToSearchResult(
      match.sermonId,
      match.paragraphId,
      searchInput.trim()
    );
  };

  const toggleMatchExpansion = (
    matchId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setExpandedMatches((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;

    // Simple case-insensitive highlighting that works for basic words like "and"
    const searchTerm = term.trim();

    try {
      // Use case-insensitive global replace
      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      return text.replace(
        regex,
        `<span class='bg-[#4b2a14] dark:bg-background px-1 text-gray-50 dark:text-[#df9e72] rounded font-medium'>$1</span>`
      );
    } catch (e) {
      // Fallback: manual highlighting
      const lowerText = text.toLowerCase();
      const lowerTerm = searchTerm.toLowerCase();
      const index = lowerText.indexOf(lowerTerm);

      if (index !== -1) {
        const before = text.slice(0, index);
        const match = text.slice(index, index + searchTerm.length);
        const after = text.slice(index + searchTerm.length);
        return `${before}<span class='bg-[#4b2a14] dark:bg-background px-1 text-gray-50 dark:text-[#df9e72] rounded font-medium'>${match}</span>${after}`;
      }

      return text;
    }
  };

  // Loading skeleton component
  const SearchSkeleton = () => (
    <div className="p-4 space-y-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-primary border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              <div className="flex items-center gap-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-8"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/5"></div>
            </div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24 mt-3"></div>
          </div>
        ))}
      </div>
    </div>
  );

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
          <SearchSkeleton />
        ) : foundMatches.length > 0 ? (
          <div className="p-4 space-y-4">
            <div className="text-sm text-stone-600 dark:text-gray-400 mb-4">
              Found {foundMatches.length} match
              {foundMatches.length !== 1 ? "es" : ""} in{" "}
              {new Set(foundMatches.map((m) => m.sermonId)).size} sermon
              {new Set(foundMatches.map((m) => m.sermonId)).size !== 1
                ? "s"
                : ""}{" "}
              for "{searchInput.trim()}"
            </div>

            {foundMatches.map((match, index) => {
              const uniqueMatchId = `${match.sermonId}-${match.paragraphId}-${index}`;

              return (
                <div
                  key={uniqueMatchId}
                  className="bg-white dark:bg-primary border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
                  onClick={() => handleMatchClick(match)}
                >
                  <div className="flex justify-between items-start">
                    <h1 className="font-bold text-stone-700 dark:text-orange-100 text-sm">
                      {match.sermonTitle}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-gray-400">
                      {match.sermonYear && <span>{match.sermonYear}</span>}
                      {match.sermonLocation && (
                        <span>• {match.sermonLocation}</span>
                      )}
                      <span className="bg-[#4b2a14]  text-stone-200 dark:text-orange-300 px-2 py-1 rounded-full text-xs">
                        ¶{match.paragraphId}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    {expandedMatches[uniqueMatchId] ? (
                      <div className="text-sm leading-relaxed">
                        <span className="text-stone-600 dark:text-accent">
                          {match.contextBefore}
                        </span>
                        <span className="bg-[#804a26] dark:bg-background px-1 rounded font-medium text-stone-200 dark:text-gray-100">
                          {match.matchedText}
                        </span>
                        <span className="text-stone-600 dark:text-gray-300">
                          {match.contextAfter}
                        </span>
                      </div>
                    ) : (
                      <p
                        className="text-stone-600 dark:text-accent text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(
                            match.paragraphContent,
                            searchInput.trim()
                          ),
                        }}
                      />
                    )}

                    <button
                      className="flex items-center mt-3 text-xs text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-background px-2 py-1 rounded"
                      onClick={(e) => toggleMatchExpansion(uniqueMatchId, e)}
                    >
                      {expandedMatches[uniqueMatchId] ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Show More
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
