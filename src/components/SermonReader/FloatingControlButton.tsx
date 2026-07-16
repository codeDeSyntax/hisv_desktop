import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, GripVertical } from "lucide-react";
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
  const { isDarkMode, accentColor } = useTheme();
  const [dragConstraints, setDragConstraints] = useState({
    left: -800,
    right: 20,
    top: -40,
    bottom: 600,
  });

  useEffect(() => {
    const updateConstraints = () => {
      setDragConstraints({
        left: -window.innerWidth + 240,
        right: 20,
        top: -40,
        bottom: window.innerHeight - 180,
      });
    };
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  if (!isVisible) return null;

  const buttonClass = `h-7 w-7 rounded-lg transition-all duration-150 flex items-center justify-center border-0 outline-none cursor-pointer ${
    isDarkMode
      ? "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
  }`;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      drag
      dragMomentum={false}
      dragElastic={0.06}
      dragConstraints={dragConstraints}
      className="fixed right-[45%] top-20 z-40 flex items-center gap-1.5 rounded-xl px-2 py-1 shadow-lg backdrop-blur-md select-none bg-white/75 dark:bg-zinc-900/75 border border-solid"
      style={{
        borderColor: showControlPanel ? accentColor : (isDarkMode ? "rgba(63, 63, 70, 0.4)" : "rgba(228, 228, 231, 0.8)"),
        boxShadow: showControlPanel
          ? `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 12px ${accentColor}25`
          : undefined,
      }}
    >
      {/* Sleek Grip Handle */}
      <div 
        className="cursor-grab active:cursor-grabbing px-0.5 py-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        title="Drag to reposition"
      >
        <GripVertical size={13} className="block" />
      </div>

      <button
        type="button"
        onClick={onDecreaseFontSize}
        className={buttonClass}
        title="Decrease font size (Ctrl+-)"
        aria-label="Decrease font size"
      >
        <Minus size={13} />
      </button>

      <span className="min-w-[20px] text-center text-[11px] font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
        {fontSize}
      </span>

      <button
        type="button"
        onClick={onIncreaseFontSize}
        className={buttonClass}
        title="Increase font size (Ctrl++)"
        aria-label="Increase font size"
      >
        <Plus size={13} />
      </button>

      {/* Vertical Divider */}
      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 self-center" />

      <button
        type="button"
        onClick={onToggle}
        className={`${buttonClass} ${
          showControlPanel
            ? isDarkMode
              ? "bg-zinc-800 text-white"
              : "bg-zinc-100 text-zinc-950"
            : ""
        }`}
        title="Sermon details"
        aria-label="Sermon details"
        aria-pressed={showControlPanel}
      >
        <InfoCircleFilled 
          size={14} 
          style={{ color: showControlPanel ? accentColor : undefined }}
          className="mx-auto" 
        />
      </button>
    </motion.div>
  );
};

export default FloatingControlButton;
