import React from "react";
import { motion } from "framer-motion";
import { HighlightData, SermonParagraph as SermonParagraphType } from "./types";

interface SermonParagraphProps {
  paragraph: SermonParagraphType;
  index: number;
  highlights: { [key: string]: HighlightData };
  currentParagraph: number;
  textColor: string;
  darkMode: boolean;
  onTextSelection: () => void;
}

export const SermonParagraph: React.FC<SermonParagraphProps> = ({
  paragraph,
  index,
  highlights,
  currentParagraph,
  textColor,
  darkMode,
  onTextSelection,
}) => {
  // Helper function to render text with highlights
  const renderTextWithHighlights = (content: string, paragraphId: number) => {
    const paragraphHighlights = highlights[paragraphId] || {};
    const highlightRanges = Object.values(paragraphHighlights).sort(
      (a: HighlightData, b: HighlightData) => a.startOffset - b.startOffset
    );

    if (highlightRanges.length === 0) {
      return content;
    }

    const parts = [];
    let lastOffset = 0;

    highlightRanges.forEach((highlight: HighlightData) => {
      // Add text before highlight
      if (highlight.startOffset > lastOffset) {
        parts.push(
          <span key={`text-${lastOffset}`}>
            {content.substring(lastOffset, highlight.startOffset)}
          </span>
        );
      }

      // Add highlighted text
      parts.push(
        <span
          key={`highlight-${highlight.startOffset}-${highlight.endOffset}`}
          style={{
            backgroundColor: highlight.color,
            color: highlight.text ? "#000" : "inherit",
          }}
          className="rounded px-1"
        >
          {content.substring(highlight.startOffset, highlight.endOffset)}
        </span>
      );

      lastOffset = highlight.endOffset;
    });

    // Add remaining text
    if (lastOffset < content.length) {
      parts.push(
        <span key={`text-${lastOffset}`}>{content.substring(lastOffset)}</span>
      );
    }

    return parts;
  };

  return (
    <motion.div
      id={`paragraph-${paragraph.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`mb-8 p-6 rounded-lg transition-all duration-300 ${
        paragraph.id === currentParagraph
          ? darkMode
            ? "bg-gray-700/50 border-l-4 border-blue-400"
            : "bg-blue-50 border-l-4 border-blue-500"
          : darkMode
          ? "bg-gray-800/30 hover:bg-gray-700/40"
          : "bg-white hover:bg-gray-50"
      } shadow-sm border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      onMouseUp={onTextSelection}
      style={{ fontSize: "18px", lineHeight: "1.8" }}
    >
      <div
        className={`paragraph-content ${textColor} leading-relaxed text-justify`}
        style={{
          fontFamily: "Georgia, serif",
          textAlign: "justify",
        }}
      >
        {renderTextWithHighlights(paragraph.content, paragraph.id)}
      </div>
    </motion.div>
  );
};
