import { useState, useCallback } from "react";
import {
  SelectionRange,
  HighlightsState,
  PalettePosition,
  ColorOption,
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
        setShowColorPalette(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();

      if (selectedText.length === 0) {
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
        setShowColorPalette(false);
        return;
      }

      const paragraphId = parseInt(htmlElement.id.replace("paragraph-", ""));

      // Calculate text offsets within the paragraph
      const paragraphText =
        sermonParagraphs.find((p) => p.id === paragraphId)?.content || "";
      const startOffset = paragraphText.indexOf(selectedText);
      const endOffset = startOffset + selectedText.length;

      if (startOffset === -1) {
        setShowColorPalette(false);
        return;
      }

      // Set selection info
      setSelectionRange({
        paragraphId,
        startOffset,
        endOffset,
        text: selectedText,
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

      setShowColorPalette(true);
    }, 10); // Small delay to ensure selection is stable
  }, [sermonParagraphs, scrollContainerRef]);

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
    highlightColors,
    handleTextSelection,
    applyHighlight,
    removeHighlight,
    setHighlights,
  };
};
