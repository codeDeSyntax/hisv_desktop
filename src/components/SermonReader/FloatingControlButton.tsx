import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { InfoCircleFilled, InfoCircleTwoTone } from "@ant-design/icons";

interface FloatingControlButtonProps {
  showControlPanel: boolean;
  onToggle: () => void;
  isVisible: boolean;
}

const FloatingControlButton = ({
  showControlPanel,
  onToggle,
  isVisible,
}: FloatingControlButtonProps) => {
  const { isDarkMode } = useTheme();

  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className={`fixed right-10 top-16 z-40 w-10 h-10 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
        isDarkMode
          ? "bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200"
          : "bg-white/90 hover:bg-zinc-50 text-zinc-700"
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
      <InfoCircleFilled size={20} className="mx-auto" />
    </motion.button>
  );
};

export default FloatingControlButton;
