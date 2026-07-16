// components/ThemeToggle.tsx

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { Tooltip } from "antd";

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    // <motion.button
    //   whileHover={{ scale: 1.05 }}
    //   whileTap={{ scale: 0.95 }}
    //   onClick={toggleDarkMode}
    //   className=" rounded-full bg-zinc-200 dark:bg-zinc-80 h-5 w-5 flex items-center justify-center shadow-md hover:shadow-lg transition duration-200 ease-in-out"
    //   aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    // >
    //   {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    // </motion.button>
    <Tooltip title={isDarkMode ? "Light mode" : "Dark mode"}>
      <button
        onClick={(e) => toggleDarkMode({ x: e.clientX, y: e.clientY })}
        className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-[var(--tb-hover-bg,rgba(244,244,245,0.85))] dark:hover:bg-[var(--tb-hover-bg,rgba(39,39,42,0.8))]"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <Sun
            size={18}
            className="text-[var(--tb-fg,#71717a)] hover:text-[var(--tb-fg-hover,#18181b)] transition-colors"
          />
        ) : (
          <Moon
            size={18}
            className="text-[var(--tb-fg,#71717a)] hover:text-[var(--tb-fg-hover,#18181b)] transition-colors"
          />
        )}
      </button>
    </Tooltip>
  );
};
