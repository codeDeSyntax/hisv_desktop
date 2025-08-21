import React from "react";
import { motion } from "framer-motion";
import { SermonParagraph } from "./SermonParagraph";
import {
  SermonParagraph as SermonParagraphType,
  HighlightsState,
} from "./types";

interface SermonContentProps {
  sermonParagraphs: SermonParagraphType[];
  highlights: HighlightsState;
  currentParagraph: number;
  textColor: string;
  darkMode: boolean;
  onTextSelection: () => void;
}

export const SermonContent: React.FC<SermonContentProps> = ({
  sermonParagraphs,
  highlights,
  currentParagraph,
  textColor,
  darkMode,
  onTextSelection,
}) => {
  return (
    <div className="sermon-content">
      {sermonParagraphs.map((paragraph, index) => (
        <SermonParagraph
          key={paragraph.id}
          paragraph={paragraph}
          index={index}
          highlights={highlights[paragraph.id] || {}}
          currentParagraph={currentParagraph}
          textColor={textColor}
          darkMode={darkMode}
          onTextSelection={onTextSelection}
        />
      ))}
    </div>
  );
};
