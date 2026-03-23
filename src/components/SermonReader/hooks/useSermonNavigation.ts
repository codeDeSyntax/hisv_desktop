import { useState, useEffect, useCallback, useRef } from "react";

interface PersistedNavigationState {
  sermonKey: string;
  searchQuery: string;
  currentSearchIndex: number;
  isSearchVisible: boolean;
  currentParagraph: number;
}

let persistedNavigationState: PersistedNavigationState | null = null;

export const useSermonNavigation = (
  sermonParagraphs: any[],
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  sermonId?: string | number,
) => {
  const sermonKey = sermonId == null ? null : String(sermonId);

  const [currentParagraph, setCurrentParagraph] = useState(() => {
    if (!sermonKey) return 0;
    if (persistedNavigationState?.sermonKey !== sermonKey) return 0;
    return persistedNavigationState.currentParagraph || 0;
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    if (!sermonKey) return "";
    if (persistedNavigationState?.sermonKey !== sermonKey) return "";
    return persistedNavigationState.searchQuery || "";
  });
  const [searchResultsCount, setSearchResultsCount] = useState(0);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(() => {
    if (!sermonKey) return 0;
    if (persistedNavigationState?.sermonKey !== sermonKey) return 0;
    return persistedNavigationState.currentSearchIndex || 0;
  });
  const [searchResultElements, setSearchResultElements] =
    useState<NodeListOf<Element> | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(() => {
    if (!sermonKey) return false;
    if (persistedNavigationState?.sermonKey !== sermonKey) return false;
    return persistedNavigationState.isSearchVisible || false;
  });
  const hasRestoredSearchRef = useRef(false);
  const isHydratingRef = useRef(true);

  // Track sermon identity to detect changes
  const lastSermonLengthRef = useRef(sermonParagraphs.length);
  const lastFirstParagraphRef = useRef(sermonParagraphs[0]?.content || "");

  const scrollSearchElementToCenter = useCallback(
    (targetElement: HTMLElement) => {
      const scrollContainer = targetElement.closest(
        ".overflow-y-auto",
      ) as HTMLElement | null;
      if (!scrollContainer) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = targetElement.getBoundingClientRect();

      const scrollTop = scrollContainer.scrollTop;
      const elementRelativeTop = elementRect.top - containerRect.top;
      const centerOffset = (containerRect.height - elementRect.height) / 2;
      const targetScroll = scrollTop + elementRelativeTop - centerOffset;

      scrollContainer.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    },
    [],
  );

  const scrollToSearchIndex = useCallback(
    (index: number, elementsArg?: NodeListOf<Element> | null) => {
      const elements = elementsArg ?? searchResultElements;
      if (!elements || elements.length === 0) return;

      const clampedIndex = Math.min(Math.max(index, 1), elements.length);
      setCurrentSearchIndex(clampedIndex);

      const targetElement = elements[clampedIndex - 1] as HTMLElement;
      if (targetElement) {
        scrollSearchElementToCenter(targetElement);
      }
    },
    [searchResultElements, scrollSearchElementToCenter],
  );

  // Reset currentParagraph when sermon changes
  useEffect(() => {
    const currentLength = sermonParagraphs.length;
    const currentFirstContent = sermonParagraphs[0]?.content || "";

    // If sermon length or first paragraph content changed, it's a new sermon
    if (
      currentLength !== lastSermonLengthRef.current ||
      currentFirstContent !== lastFirstParagraphRef.current
    ) {
      setCurrentParagraph(0);
      lastSermonLengthRef.current = currentLength;
      lastFirstParagraphRef.current = currentFirstContent;
    }
  }, [sermonParagraphs]);

  // Handle Ctrl+F keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsSearchVisible(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Enhanced search functionality that handles both text and paragraph numbers
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResultsCount(0);
        setCurrentSearchIndex(0);
        setSearchResultElements(null);

        // Remove existing highlights
        const existingHighlights =
          document.querySelectorAll(".search-highlight");
        existingHighlights.forEach((el) => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(el.textContent || ""),
              el,
            );
            parent.normalize();
          }
        });
        return;
      }

      // Check if query is a paragraph number
      const paragraphNumber = parseInt(query);
      if (!isNaN(paragraphNumber) && paragraphNumber > 0) {
        // Navigate to specific paragraph
        const targetParagraph = sermonParagraphs.find(
          (p) => p.id === paragraphNumber,
        );
        if (targetParagraph) {
          const element = document.getElementById(
            `paragraph-${paragraphNumber}`,
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setCurrentParagraph(paragraphNumber);
            setSearchResultsCount(1);
            setCurrentSearchIndex(1);
            // Highlight the entire paragraph temporarily
            element.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
            setTimeout(() => {
              element.style.backgroundColor = "";
            }, 2000);
            return;
          }
        }
        setSearchResultsCount(0);
        setCurrentSearchIndex(0);
        return;
      }

      // Find and highlight search results while preserving original styling
      const searchRegex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      let resultCount = 0;

      sermonParagraphs.forEach((paragraph) => {
        const paragraphElement = document.getElementById(
          `paragraph-${paragraph.id}`,
        );
        if (paragraphElement) {
          // Remove existing search highlights first
          const existingHighlights =
            paragraphElement.querySelectorAll(".search-highlight");
          existingHighlights.forEach((el) => {
            const parent = el.parentNode;
            if (parent) {
              parent.replaceChild(
                document.createTextNode(el.textContent || ""),
                el,
              );
              parent.normalize();
            }
          });

          // Apply search highlighting while preserving the original structure
          const walker = document.createTreeWalker(
            paragraphElement,
            NodeFilter.SHOW_TEXT,
            null,
          );

          const textNodes: Text[] = [];
          let node;
          while ((node = walker.nextNode())) {
            textNodes.push(node as Text);
          }

          textNodes.forEach((textNode) => {
            const content = textNode.textContent || "";
            const matches = content.match(searchRegex);
            if (matches) {
              resultCount += matches.length;
              const parent = textNode.parentNode;
              if (parent) {
                const fragment = document.createDocumentFragment();
                const parts = content.split(searchRegex);

                parts.forEach((part, index) => {
                  if (searchRegex.test(part)) {
                    const highlight = document.createElement("span");
                    const isDark =
                      document.documentElement.classList.contains("dark");
                    highlight.className = "search-highlight";
                    highlight.style.borderRadius = "8px";
                    highlight.style.padding = "0 2px";
                    highlight.style.fontWeight = "600";
                    highlight.style.border = `1px solid ${isDark ? "#ffffff" : "#000000"}`;
                    highlight.textContent = part;
                    fragment.appendChild(highlight);
                  } else if (part) {
                    fragment.appendChild(document.createTextNode(part));
                  }
                });

                parent.replaceChild(fragment, textNode);
              }
            }
          });
        }
      });

      setSearchResultsCount(resultCount);
      setCurrentSearchIndex(resultCount > 0 ? 1 : 0);

      // Get all search result elements
      const results = document.querySelectorAll(".search-highlight");
      setSearchResultElements(results);

      // Navigate to first result if any
      if (results.length > 0) {
        scrollToSearchIndex(1, results);
      }
    },
    [sermonParagraphs, scrollToSearchIndex],
  );

  // Navigate to next search result
  const goToNextSearchResult = useCallback(() => {
    if (!searchResultElements || searchResultElements.length === 0) return;

    // Move to next result, wrap around to 1 if at the end
    const nextIndex =
      currentSearchIndex >= searchResultElements.length
        ? 1
        : currentSearchIndex + 1;
    setCurrentSearchIndex(nextIndex);

    scrollToSearchIndex(nextIndex);
  }, [searchResultElements, currentSearchIndex, scrollToSearchIndex]);

  // Navigate to previous search result
  const goToPreviousSearchResult = useCallback(() => {
    if (!searchResultElements || searchResultElements.length === 0) return;

    // Move to previous result, wrap around to last if at the beginning
    const prevIndex =
      currentSearchIndex <= 1
        ? searchResultElements.length
        : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);

    scrollToSearchIndex(prevIndex);
  }, [searchResultElements, currentSearchIndex, scrollToSearchIndex]);

  // Navigate to specific paragraph
  const goToParagraph = useCallback(
    (paragraphId: number) => {
      const scrollToElement = () => {
        const element = document.getElementById(`paragraph-${paragraphId}`);
        const container = scrollContainerRef.current;

        if (element && container) {
          // Get the container's scroll parent (the overflow-y-auto div)
          const scrollParent = container.parentElement;

          if (scrollParent) {
            // Calculate the element's position relative to the scroll parent
            const containerRect = scrollParent.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Calculate scroll position to center the element
            const scrollTop = scrollParent.scrollTop;
            const elementRelativeTop = elementRect.top - containerRect.top;
            const centerOffset =
              (containerRect.height - elementRect.height) / 2;
            const targetScroll = scrollTop + elementRelativeTop - centerOffset;

            // Smooth scroll to the calculated position
            scrollParent.scrollTo({
              top: targetScroll,
              behavior: "smooth",
            });

            setCurrentParagraph(paragraphId);
          }
        }
      };

      // Add a small delay to let any layout transitions complete
      setTimeout(scrollToElement, 100);
    },
    [scrollContainerRef],
  );

  // Navigate to previous paragraph
  const goToPreviousParagraph = useCallback(() => {
    if (currentParagraph > 0) {
      const newParagraph = currentParagraph - 1;
      goToParagraph(newParagraph);
    }
  }, [currentParagraph, goToParagraph]);

  // Navigate to next paragraph
  const goToNextParagraph = useCallback(() => {
    if (currentParagraph < sermonParagraphs.length - 1) {
      const newParagraph = currentParagraph + 1;
      goToParagraph(newParagraph);
    }
  }, [currentParagraph, sermonParagraphs.length, goToParagraph]);

  // Chrome-style search functions
  const showSearch = useCallback(() => {
    setIsSearchVisible(true);
  }, []);

  const hideSearch = useCallback(() => {
    setIsSearchVisible(false);
  }, []);

  // Handle scroll tracking for current paragraph
  useEffect(() => {
    hasRestoredSearchRef.current = false;
    isHydratingRef.current = true;
  }, [sermonKey]);

  useEffect(() => {
    if (!sermonKey || sermonParagraphs.length === 0) return;
    if (hasRestoredSearchRef.current) return;
    if (!persistedNavigationState) {
      isHydratingRef.current = false;
      return;
    }
    if (persistedNavigationState.sermonKey !== sermonKey) {
      isHydratingRef.current = false;
      return;
    }

    const persistedQuery = persistedNavigationState.searchQuery?.trim();
    if (!persistedQuery) {
      isHydratingRef.current = false;
      return;
    }

    hasRestoredSearchRef.current = true;
    setIsSearchVisible(persistedNavigationState.isSearchVisible);

    handleSearch(persistedQuery);

    const targetIndex = Math.max(
      1,
      persistedNavigationState.currentSearchIndex || 1,
    );

    setTimeout(() => {
      const results = document.querySelectorAll(".search-highlight");
      setSearchResultElements(results);
      if (results.length > 0) {
        scrollToSearchIndex(targetIndex, results);
      }
      isHydratingRef.current = false;
    }, 120);
  }, [sermonKey, sermonParagraphs.length, handleSearch, scrollToSearchIndex]);

  useEffect(() => {
    if (!sermonKey) return;
    if (isHydratingRef.current) return;

    persistedNavigationState = {
      sermonKey,
      searchQuery,
      currentSearchIndex,
      isSearchVisible,
      currentParagraph,
    };
  }, [
    sermonKey,
    searchQuery,
    currentSearchIndex,
    isSearchVisible,
    currentParagraph,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let currentParagraphId = 0;
      let minDistance = Infinity;

      sermonParagraphs.forEach((paragraph) => {
        const element = document.getElementById(`paragraph-${paragraph.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - centerY);

          if (distance < minDistance) {
            minDistance = distance;
            currentParagraphId = paragraph.id;
          }
        }
      });

      setCurrentParagraph(currentParagraphId);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [sermonParagraphs, scrollContainerRef]);

  return {
    currentParagraph,
    searchQuery,
    searchResultsCount,
    currentSearchIndex,
    handleSearch,
    goToNextSearchResult,
    goToPreviousSearchResult,
    goToParagraph,
    goToPreviousParagraph,
    goToNextParagraph,
    setSearchQuery,
    isSearchVisible,
    setIsSearchVisible,
    showSearch,
    hideSearch,
  };
};
