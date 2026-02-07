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
      initial={{ opacity: 0, scale: 0.9, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -5 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed z-[100] bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-600 p-2 flex gap-1.5 backdrop-blur-sm"
      style={{
        left: `${palettePosition.x}px`,
        top: `${palettePosition.y}px`,
        transform: "translateX(-50%)",
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
            className={`w-9 h-9 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg relative ${
              isCurrentlyHighlighted
                ? "border-stone-800 dark:border-stone-200 scale-105 shadow-md"
                : "border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500"
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
                <X
                  size={14}
                  className="text-stone-800 dark:text-stone-200 drop-shadow"
                />
              </div>
            )}
          </button>
        );
      })}
    </motion.div>
  );
};

export default ColorPalette;
