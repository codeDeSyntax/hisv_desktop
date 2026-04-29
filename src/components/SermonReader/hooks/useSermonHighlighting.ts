import { useState, useCallback, useEffect, useRef } from "react";
import {
  SelectionRange,
  HighlightsState,
  PalettePosition,
  ColorOption,
  SelectionOverlayRect,
} from "../types";

export const useSermonHighlighting = (
  sermonParagraphs: any[],
  scrollContainerRef: React.RefObject<HTMLDivElement>,
) => {
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null,
  );
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [palettePosition, setPalettePosition] = useState<PalettePosition>({
    x: 0,
    y: 0,
  });
  const [highlights, setHighlights] = useState<HighlightsState>({});
  const [selectionOverlayRects, setSelectionOverlayRects] = useState<
    SelectionOverlayRect[]
  >([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate text offset in container by extracting all visible text content.
   * This approach is more robust for complex DOM structures with nested elements.
   */
  const getTextOffsetInContainer = useCallback(
    (container: Node, targetNode: Node, nodeOffset: number) => {
      // Extract all text content from the container in order
      let totalOffset = 0;
      let foundTarget = false;

      const processNode = (
        node: Node,
        searchNode: Node,
        searchOffset: number,
      ): number => {
        if (node === searchNode) {
          // Found the target node - return total offset + local offset
          foundTarget = true;
          return (
            totalOffset +
            Math.min(searchOffset, (node as Text).textContent?.length || 0)
          );
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const textLength = (node as Text).textContent?.length || 0;
          totalOffset += textLength;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Process child nodes
          for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            const result = processNode(child, searchNode, searchOffset);
            if (foundTarget) return result;
          }
        }

        return -1;
      };

      return processNode(container, targetNode, nodeOffset);
    },
    [],
  );

  const getSelectionRects = useCallback((): SelectionOverlayRect[] => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return [];
    }

    const rects: SelectionOverlayRect[] = [];

    for (let rangeIndex = 0; rangeIndex < selection.rangeCount; rangeIndex++) {
      const range = selection.getRangeAt(rangeIndex);
      if (range.collapsed) continue;

      let paragraphElement: Node | null = range.commonAncestorContainer;
      if (paragraphElement.nodeType === Node.TEXT_NODE) {
        paragraphElement = paragraphElement.parentElement;
      }

      let htmlElement = paragraphElement as HTMLElement | null;
      while (htmlElement && !htmlElement.id?.startsWith("paragraph-")) {
        htmlElement = htmlElement.parentElement;
      }

      const paragraphContentElement = htmlElement?.querySelector(
        '[data-paragraph-content="true"]',
      );

      if (!paragraphContentElement) continue;

      if (
        !paragraphContentElement.contains(range.startContainer) ||
        !paragraphContentElement.contains(range.endContainer)
      ) {
        continue;
      }

      const clientRects = Array.from(range.getClientRects());
      clientRects.forEach((rect, rectIndex) => {
        if (rect.width < 2 || rect.height < 2) return;
        rects.push({
          id: `${rangeIndex}-${rectIndex}-${Math.round(rect.left)}-${Math.round(rect.top)}`,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      });
    }

    return rects;
  }, []);

  useEffect(() => {
    const updateSelectionPreview = () => {
      // Debounce updates to prevent rapid state changes and layout thrashing
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        setSelectionOverlayRects(getSelectionRects());
      }, 16); // ~60fps, batch updates
    };

    document.addEventListener("selectionchange", updateSelectionPreview);
    window.addEventListener("resize", updateSelectionPreview);
    window.addEventListener("scroll", updateSelectionPreview, true);

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      document.removeEventListener("selectionchange", updateSelectionPreview);
      window.removeEventListener("resize", updateSelectionPreview);
      window.removeEventListener("scroll", updateSelectionPreview, true);
    };
  }, [getSelectionRects]);

  // Color palette for highlighting
  const highlightColors: ColorOption[] = [
    { name: "Yellow", color: "#fef08a", textColor: "#854d0e" },
    { name: "Green", color: "#bbf7d0", textColor: "#14532d" },
    { name: "Blue", color: "#bfdbfe", textColor: "#1e3a8a" },
    { name: "Pink", color: "#fce7f3", textColor: "#be185d" },
    { name: "Purple", color: "#e9d5ff", textColor: "#6b21a8" },
    { name: "Orange", color: "#fed7aa", textColor: "#c2410c" },
    { name: "Red", color: "#fecaca", textColor: "#dc2626" },
    { name: "zinc", color: "#e5e7eb", textColor: "#374151" },
  ];

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    // Debounce to avoid excessive state updates during active selection
    if (selectionChangeTimeoutRef.current) {
      clearTimeout(selectionChangeTimeoutRef.current);
    }

    selectionChangeTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText.trim().length === 0) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      // Find the paragraph that contains the selection
      let paragraphElement: Node | null = range.commonAncestorContainer;

      // If it's a text node, get its parent element
      if (paragraphElement.nodeType === Node.TEXT_NODE) {
        paragraphElement = paragraphElement.parentElement;
      }

      // Cast to HTMLElement
      let htmlElement = paragraphElement as HTMLElement | null;

      // Traverse up to find the paragraph container
      while (htmlElement && !htmlElement.id?.startsWith("paragraph-")) {
        htmlElement = htmlElement.parentElement;
      }

      if (!htmlElement?.id) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      const paragraphId = parseInt(htmlElement.id.replace("paragraph-", ""));

      const paragraphContentElement = htmlElement.querySelector(
        '[data-paragraph-content="true"]',
      );

      if (!paragraphContentElement) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      if (
        !paragraphContentElement.contains(range.startContainer) ||
        !paragraphContentElement.contains(range.endContainer)
      ) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      // Get the actual paragraph text from our data
      const paragraphData = sermonParagraphs.find((p) => p.id === paragraphId);
      if (!paragraphData) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      const paragraphText = paragraphData.content;

      // Calculate text offsets within the paragraph content
      const startOffset = getTextOffsetInContainer(
        paragraphContentElement,
        range.startContainer,
        range.startOffset,
      );
      const endOffset = getTextOffsetInContainer(
        paragraphContentElement,
        range.endContainer,
        range.endOffset,
      );

      if (
        startOffset === -1 ||
        endOffset === -1 ||
        endOffset <= startOffset ||
        endOffset > paragraphText.length
      ) {
        setSelectionOverlayRects([]);
        setShowColorPalette(false);
        return;
      }

      // Validate that the selected text roughly matches the paragraph content
      const selectedTextFromParagraph = paragraphText.substring(
        startOffset,
        endOffset,
      );

      // Set selection info
      setSelectionRange({
        paragraphId,
        startOffset,
        endOffset,
        text: selectedText,
      });

      // Position the color palette above the selection
      const rect = range.getBoundingClientRect();
      const paletteY = rect.top - 50;
      const paletteX = rect.left + rect.width / 2;

      setPalettePosition({
        x: paletteX,
        y: Math.max(paletteY, 60),
      });

      setSelectionOverlayRects(getSelectionRects());
      setShowColorPalette(true);
    }, 8); // Small debounce to ensure selection is stable
  }, [sermonParagraphs, getTextOffsetInContainer, getSelectionRects]);

  // Apply highlight
  const applyHighlight = useCallback(
    (color: string, textColor: string) => {
      if (!selectionRange) return;

      const { paragraphId, startOffset, endOffset, text } = selectionRange;
      const highlightKey = `${startOffset}-${endOffset}`;

      setHighlights((prev) => {
        const updated = { ...prev };
        if (!updated[paragraphId]) {
          updated[paragraphId] = {};
        }

        const existingHighlights = updated[paragraphId];

        // Remove any overlapping highlights
        Object.keys(existingHighlights).forEach((key) => {
          const existing = existingHighlights[key];
          const isOverlapping =
            startOffset < existing.endOffset &&
            endOffset > existing.startOffset;

          if (isOverlapping) {
            delete existingHighlights[key];
          }
        });

        // Add the new highlight
        updated[paragraphId][highlightKey] = {
          startOffset,
          endOffset,
          color,
          text,
        };

        return updated;
      });

      // Clear selection without causing layout shift
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Clear UI immediately and smoothly
      setSelectionOverlayRects([]);
      setShowColorPalette(false);
      setSelectionRange(null);
    },
    [selectionRange],
  );

  // Remove highlight by key
  const removeHighlight = useCallback(
    (paragraphId: number, highlightKey: string) => {
      setHighlights((prev) => {
        const updated = { ...prev };
        if (updated[paragraphId]) {
          delete updated[paragraphId][highlightKey];
          if (Object.keys(updated[paragraphId]).length === 0) {
            delete updated[paragraphId];
          }
        }
        return updated;
      });
    },
    [],
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      if (selectionChangeTimeoutRef.current) {
        clearTimeout(selectionChangeTimeoutRef.current);
      }
    };
  }, []);

  return {
    selectionRange,
    showColorPalette,
    palettePosition,
    highlights,
    selectionOverlayRects,
    highlightColors,
    handleTextSelection,
    applyHighlight,
    removeHighlight,
    setHighlights,
  };
};
