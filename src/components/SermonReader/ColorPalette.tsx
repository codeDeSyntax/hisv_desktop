import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  ColorOption,
  SelectionRange,
  PalettePosition,
  HighlightsState,
} from "./types";

interface ColorPaletteProps {
  showColorPalette: boolean;
  selectionRange: SelectionRange | null;
  palettePosition: PalettePosition;
  highlightColors: ColorOption[];
  highlights: HighlightsState;
  onApplyHighlight: (color: string, textColor: string) => void;
}

const ColorPalette = ({
  showColorPalette,
  selectionRange,
  palettePosition,
  highlightColors,
  highlights,
  onApplyHighlight,
}: ColorPaletteProps) => {
  if (!showColorPalette || !selectionRange) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1"
      style={{
        left: palettePosition.x - 140, // Center the palette
        top: palettePosition.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {highlightColors.map((colorOption) => {
        const isCurrentlyHighlighted =
          highlights[selectionRange.paragraphId]?.[
            `${selectionRange.startOffset}-${selectionRange.endOffset}`
          ]?.color === colorOption.color;

        return (
          <button
            key={colorOption.name}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 relative ${
              isCurrentlyHighlighted
                ? "border-gray-800 dark:border-gray-200 scale-110"
                : "border-gray-300 dark:border-gray-600"
            }`}
            style={{ backgroundColor: colorOption.color }}
            onClick={() =>
              onApplyHighlight(colorOption.color, colorOption.textColor)
            }
            title={`Highlight with ${colorOption.name}${
              isCurrentlyHighlighted ? " (Click to remove)" : ""
            }`}
          >
            {isCurrentlyHighlighted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <X size={12} className="text-gray-800 dark:text-gray-200" />
              </div>
            )}
          </button>
        );
      })}
    </motion.div>
  );
};

export default ColorPalette;
