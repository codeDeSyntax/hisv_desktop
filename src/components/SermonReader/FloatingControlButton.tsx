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
          ? "bg-stone-800/90 hover:bg-stone-700 text-stone-200"
          : "bg-white/90 hover:bg-stone-50 text-stone-700"
      } border-2 ${
        showControlPanel
          ? isDarkMode
            ? "border-stone-500 shadow-stone-500/50"
            : "border-stone-400 shadow-stone-400/30"
          : isDarkMode
            ? "border-stone-700"
            : "border-stone-300"
      }`}
    >
      <InfoCircleFilled size={20} className="mx-auto" />
    </motion.button>
  );
};

export default FloatingControlButton;
