import React from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { InfoCircleFilled } from "@ant-design/icons";

interface FloatingControlButtonProps {
  showControlPanel: boolean;
  onToggle: () => void;
  isVisible: boolean;
  fontSize: number;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
}

const FloatingControlButton = ({
  showControlPanel,
  onToggle,
  isVisible,
  fontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
}: FloatingControlButtonProps) => {
  const { isDarkMode } = useTheme();

  if (!isVisible) return null;

  const buttonClass = `h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center ${
    isDarkMode
      ? "text-zinc-200 hover:bg-zinc-700"
      : "text-zinc-700 hover:bg-zinc-100"
  }`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`fixed right-10 top-16 z-40 flex items-center gap-1 rounded-full px-1.5 py-1 shadow-xl transition-all duration-300 backdrop-blur-sm ${
        isDarkMode
          ? "bg-zinc-800/90 text-zinc-200"
          : "bg-white/90 text-zinc-700"
      } border-2 ${
        showControlPanel
          ? isDarkMode
            ? "border-zinc-500 shadow-zinc-500/50"
            : "border-zinc-400 shadow-zinc-400/30"
          : isDarkMode
            ? "border-zinc-700"
            : "border-zinc-300"
      }`}
    >
      <button
        type="button"
        onClick={onDecreaseFontSize}
        className={buttonClass}
        title="Decrease font size"
        aria-label="Decrease font size"
      >
        <Minus size={16} />
      </button>

      <span className="min-w-8 text-center text-[11px] font-semibold tabular-nums">
        {fontSize}
      </span>

      <button
        type="button"
        onClick={onIncreaseFontSize}
        className={buttonClass}
        title="Increase font size"
        aria-label="Increase font size"
      >
        <Plus size={16} />
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`${buttonClass} ${
          showControlPanel
            ? isDarkMode
              ? "bg-zinc-700"
              : "bg-zinc-100"
            : ""
        }`}
        title="Sermon info"
        aria-label="Sermon info"
        aria-pressed={showControlPanel}
      >
        <InfoCircleFilled size={18} className="mx-auto" />
      </button>
    </motion.div>
  );
};

export default FloatingControlButton;
