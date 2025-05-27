import { useContext, useState, useMemo } from "react";
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
  const [expandedMatches, setExpandedMatches] = useState<{
    [key: string]: boolean | undefined;
  }>({});

  const availableSermons = [
    ...earlySermons,
    ...secondSet,
    ...thirdSet,
    ...fourthSet,
    ...lastSet,
  ];

  // Function to split sermon into paragraphs (same logic as SelectedSermon)
  const createParagraphsFromSermon = (
    sermonText: string
  ): SearchParagraph[] => {
    if (!sermonText) return [];

    const rawParagraphs = sermonText.split("\n\n").filter((p) => p.trim());
    const processedParagraphs: SearchParagraph[] = [];
    let paragraphId = 1;

    rawParagraphs.forEach((paragraph, originalIndex) => {
      const words = paragraph.trim().split(/\s+/);
      const sentences = paragraph.split(/[.!?]+/).filter((s) => s.trim());

      // Determine optimal paragraph length based on content
      let targetLength: number;
      if (sentences.length <= 2 && words.length < 50) {
        targetLength = words.length;
      } else if (words.length <= 150) {
        targetLength = words.length;
      } else {
        targetLength = Math.max(
          100,
          Math.min(
            200,
            Math.floor(words.length / Math.ceil(words.length / 150))
          )
        );
      }

      if (words.length <= targetLength) {
        processedParagraphs.push({
          id: paragraphId++,
          content: paragraph.trim(),
          originalIndex,
        });
      } else {
        // Split long paragraphs intelligently
        let currentChunk = "";
        let wordCount = 0;

        words.forEach((word) => {
          if (
            wordCount > 0 &&
            (wordCount >= targetLength ||
              (wordCount >= targetLength * 0.8 && /[.!?]$/.test(word)))
          ) {
            processedParagraphs.push({
              id: paragraphId++,
              content: currentChunk.trim(),
              originalIndex,
            });
            currentChunk = word;
            wordCount = 1;
          } else {
            currentChunk += (wordCount > 0 ? " " : "") + word;
            wordCount++;
          }
        });

        if (currentChunk.trim()) {
          processedParagraphs.push({
            id: paragraphId++,
            content: currentChunk.trim(),
            originalIndex,
          });
        }
      }
    });

    return processedParagraphs;
  };

  const performAdvancedSearch = () => {
    if (!searchInput.trim()) {
      setFoundMatches([]);
      return;
    }

    const searchMatches: SearchMatch[] = [];
    const searchRegex = new RegExp(`(${searchInput.trim()})`, "i");

    availableSermons.forEach((sermon) => {
      const paragraphList = createParagraphsFromSermon(sermon.sermon);

      paragraphList.forEach((para) => {
        const matchResult = para.content.match(searchRegex);

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
        }
      });
    });

    setFoundMatches(searchMatches);
    setExpandedMatches({});
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performAdvancedSearch();
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

    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(
      regex,
      `<span class='bg-[#4b2a14] dark:bg-background px-1 text-gray-50 dark:text-[#df9e72] rounded font-medium'>$1</span>`
    );
  };

  return (
    <div className=" h-full relativ flex flex-col bg-gray-100 dark:bg-primary/50 p-4 rounded-[20px] font-zilla">
      {/* Fixed Header */}
      <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold font-serif mb-3 text-stone-700 dark:text-gray-50">
          Advanced Search
        </h2>

        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search quotes within all sermons"
              className="flex-1 p-3 text-sm bg-gray-50 dark:bg-primary border-none border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-700 text-stone-700 dark:text-white placeholder-gray-500"
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-stone-600 dark:bg-primary hover:bg-stone-700 dark:hover:bg-gray-500 text-white rounded-md transition-colors font-medium"
            >
              <SearchOutlined className="mr-1" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Scrollable Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {foundMatches.length > 0 ? (
          <div className="p-4 space-y-4">
            <div className="text-sm text-stone-600 dark:text-gray-400 mb-4">
              Found {foundMatches.length} match
              {foundMatches.length !== 1 ? "es" : ""}
              in {new Set(foundMatches.map((m) => m.sermonId)).size} sermon
              {new Set(foundMatches.map((m) => m.sermonId)).size !== 1
                ? "s"
                : ""}
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
              <p className="text-stone-600 dark:text-gray-300 font-serif italic text-sm max-w-xs">
                Search for quotes across all sermons preached by Robert Lambert
                Lee
              </p>
              {searchInput && foundMatches.length === 0 && (
                <p className="text-stone-500 dark:text-gray-400 text-sm mt-2">
                  No results found for "{searchInput}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
