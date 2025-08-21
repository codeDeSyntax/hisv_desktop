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

  // Handle search functionality
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

      // Find and highlight search results
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
          // Reset paragraph content
          paragraphElement.innerHTML = paragraph.content;

          // Apply search highlighting
          const matches = paragraph.content.match(searchRegex);
          if (matches) {
            resultCount += matches.length;
            const highlightedContent = paragraph.content.replace(
              searchRegex,
              `<span class="search-highlight bg-yellow-300 dark:bg-yellow-600">$1</span>`
            );
            paragraphElement.innerHTML = highlightedContent;
          }
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
  };
};
