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
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`fixed left-3 bottom-1/2 z-40 w-8 h-8 rounded-full shadow-lg transition-all duration-300 ${
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
      <InfoCircleFilled size={24} className="mx-auto" />
    </motion.button>
  );
};

export default FloatingControlButton;
