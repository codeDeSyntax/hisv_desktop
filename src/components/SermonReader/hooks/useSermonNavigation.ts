import { useState, useEffect, useCallback } from "react";

export const useSermonNavigation = (
  sermonParagraphs: any[],
  scrollContainerRef: React.RefObject<HTMLDivElement>
) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsCount, setSearchResultsCount] = useState(0);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [searchResultElements, setSearchResultElements] =
    useState<NodeListOf<Element> | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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
              el
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
          (p) => p.id === paragraphNumber
        );
        if (targetParagraph) {
          const element = document.getElementById(
            `paragraph-${paragraphNumber}`
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
        "gi"
      );
      let resultCount = 0;

      sermonParagraphs.forEach((paragraph) => {
        const paragraphElement = document.getElementById(
          `paragraph-${paragraph.id}`
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
                el
              );
              parent.normalize();
            }
          });

          // Apply search highlighting while preserving the original structure
          const walker = document.createTreeWalker(
            paragraphElement,
            NodeFilter.SHOW_TEXT,
            null
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
                    highlight.className =
                      "search-highlight bg-yellow-300 dark:bg-yellow-600 rounded px-1 font-medium";
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
        results[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [sermonParagraphs]
  );

  // Navigate to next search result
  const goToNextSearchResult = useCallback(() => {
    if (!searchResultElements || searchResultElements.length === 0) return;

    const nextIndex =
      currentSearchIndex < searchResultElements.length ? currentSearchIndex : 1;
    setCurrentSearchIndex(nextIndex);

    const targetElement = searchResultElements[nextIndex - 1];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchResultElements, currentSearchIndex]);

  // Navigate to previous search result
  const goToPreviousSearchResult = useCallback(() => {
    if (!searchResultElements || searchResultElements.length === 0) return;

    const prevIndex =
      currentSearchIndex > 1
        ? currentSearchIndex - 2
        : searchResultElements.length - 1;
    setCurrentSearchIndex(prevIndex + 1);

    const targetElement = searchResultElements[prevIndex];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchResultElements, currentSearchIndex]);

  // Navigate to specific paragraph
  const goToParagraph = useCallback((paragraphId: number) => {
    const element = document.getElementById(`paragraph-${paragraphId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentParagraph(paragraphId);
    }
  }, []);

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
    setSearchQuery("");
  }, []);

  // Handle scroll tracking for current paragraph
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
