import { useState, useCallback } from "react";
import {
  SelectionRange,
  HighlightsState,
  PalettePosition,
  ColorOption,
} from "../types";

export const useSermonHighlighting = (
  sermonParagraphs: any[],
  scrollContainerRef: React.RefObject<HTMLDivElement>
) => {
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
    null
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
    while (
      paragraphElement &&
      paragraphElement.nodeType !== Node.ELEMENT_NODE
    ) {
      paragraphElement = paragraphElement.parentNode;
    }

    // Cast to HTMLElement and handle null case
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
    const scrollContainer = scrollContainerRef.current;
    const containerRect = scrollContainer?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

    setPalettePosition({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 60,
    });

    setShowColorPalette(true);
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

        // Check if this exact highlight already exists with the same color
        const existingHighlight = updated[paragraphId][highlightKey];
        if (existingHighlight && existingHighlight.color === color) {
          // Remove the highlight (toggle off)
          delete updated[paragraphId][highlightKey];
          if (Object.keys(updated[paragraphId]).length === 0) {
            delete updated[paragraphId];
          }
        } else {
          // Add or update the highlight
          updated[paragraphId][highlightKey] = {
            startOffset,
            endOffset,
            color,
            text,
          };
        }

        return updated;
      });

      // Clear selection and hide palette
      window.getSelection()?.removeAllRanges();
      setShowColorPalette(false);
      setSelectionRange(null);
    },
    [selectionRange]
  );

  return {
    selectionRange,
    showColorPalette,
    palettePosition,
    highlights,
    highlightColors,
    handleTextSelection,
    applyHighlight,
    setHighlights,
  };
};
