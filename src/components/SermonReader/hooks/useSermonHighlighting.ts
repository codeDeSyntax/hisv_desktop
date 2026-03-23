import { useState, useCallback, useEffect } from "react";
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

  const getTextOffsetInContainer = useCallback(
    (container: Node, targetNode: Node, nodeOffset: number) => {
      let totalOffset = 0;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

      let currentNode = walker.nextNode();
      while (currentNode) {
        const textNode = currentNode as Text;
        const textLength = textNode.textContent?.length || 0;

        if (textNode === targetNode) {
          return totalOffset + Math.min(nodeOffset, textLength);
        }

        totalOffset += textLength;
        currentNode = walker.nextNode();
      }

      return -1;
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
      setSelectionOverlayRects(getSelectionRects());
    };

    document.addEventListener("selectionchange", updateSelectionPreview);
    window.addEventListener("resize", updateSelectionPreview);
    window.addEventListener("scroll", updateSelectionPreview, true);

    return () => {
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
    { name: "Gray", color: "#e5e7eb", textColor: "#374151" },
  ];

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
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

      // Calculate text offsets within the paragraph
      const paragraphText =
        sermonParagraphs.find((p) => p.id === paragraphId)?.content || "";

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

      // Set selection info
      setSelectionRange({
        paragraphId,
        startOffset,
        endOffset,
        text: paragraphText.substring(startOffset, endOffset),
      });

      // Position the color palette
      const rect = range.getBoundingClientRect();

      // Use viewport coordinates for fixed positioning
      const paletteY = rect.top - 50; // Position above selection
      const paletteX = rect.left + rect.width / 2; // Center horizontally on selection

      setPalettePosition({
        x: paletteX,
        y: Math.max(paletteY, 60), // Ensure it doesn't go above viewport
      });

      setSelectionOverlayRects(getSelectionRects());
      setShowColorPalette(true);
    }, 10); // Small delay to ensure selection is stable
  }, [
    sermonParagraphs,
    scrollContainerRef,
    getTextOffsetInContainer,
    getSelectionRects,
  ]);

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

        Object.keys(existingHighlights).forEach((key) => {
          const existing = existingHighlights[key];
          const isOverlapping =
            startOffset < existing.endOffset &&
            endOffset > existing.startOffset;

          if (isOverlapping) {
            delete existingHighlights[key];
          }
        });

        // Always add or update the highlight (no toggle)
        updated[paragraphId][highlightKey] = {
          startOffset,
          endOffset,
          color,
          text,
        };

        return updated;
      });

      // Clear selection and hide palette
      window.getSelection()?.removeAllRanges();
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
