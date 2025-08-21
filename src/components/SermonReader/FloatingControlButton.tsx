import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

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
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`fixed right-6 bottom-3 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
        isDarkMode
          ? "bg-primary hover:bg-gray-700 text-gray-200"
          : "bg-white hover:bg-gray-50 text-gray-700"
      } border-2 ${
        showControlPanel
          ? isDarkMode
            ? "border-blue-500"
            : "border-blue-500"
          : isDarkMode
          ? "border-primary"
          : "border-gray-300"
      }`}
    >
      <BookOpen size={24} className="mx-auto" />
    </motion.button>
  );
};

export default FloatingControlButton;
