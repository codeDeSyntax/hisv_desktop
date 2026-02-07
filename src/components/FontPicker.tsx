import React, { useState, useEffect, useRef } from "react";
import { Type, ChevronDown, Check } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

const FontPicker: React.FC = () => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [fontFamilies, setFontFamilies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load system fonts
  useEffect(() => {
    const loadSystemFonts = async () => {
      try {
        if (window.ipcRenderer) {
          const systemFonts =
            await window.ipcRenderer.invoke("get-system-fonts");
          if (systemFonts && systemFonts.length > 0) {
            setFontFamilies(systemFonts);
          }
        }
      } catch (error) {
        console.error("Error loading system fonts:", error);
        // Fallback fonts
        setFontFamilies([
          "Arial",
          "Calibri",
          "Cambria",
          "Courier New",
          "Georgia",
          "Segoe UI",
          "Times New Roman",
          "Verdana",
        ]);
      }
    };

    loadSystemFonts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleFontChange = (font: string) => {
    const newSettings = {
      ...settings,
      fontFamily: font,
    };
    setSettings(newSettings);
    localStorage.setItem("sermonSettings", JSON.stringify(newSettings));
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredFonts = fontFamilies.filter((font) =>
    font.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      ref={dropdownRef}
      className="relative"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
          isDarkMode
            ? "hover:bg-stone-800 text-stone-300"
            : "hover:bg-stone-100 text-stone-700"
        }`}
        title="Select Font Family"
      >
        <Type className="w-4 h-4" />
        <span className="text-sm font-medium max-w-[120px] truncate">
          {settings.fontFamily || "Zilla Slab"}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full right-0 mt-2 w-[420px] min-w-[200px] rounded-lg shadow-2xl border z-50 ${
              isDarkMode
                ? "bg-stone-900 border-stone-700"
                : "bg-white border-stone-200"
            }`}
          >
            {/* Search Box */}
            <div
              className={`p-2 border-b ${isDarkMode ? "border-stone-700" : "border-stone-200"}`}
            >
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-3 py-1.5 text-sm rounded border outline-none ${
                  isDarkMode
                    ? "bg-stone-800 border-stone-700 text-stone-200 placeholder-stone-500"
                    : "bg-white border-stone-300 text-stone-900 placeholder-stone-400"
                }`}
                autoFocus
              />
            </div>

            {/* Font List */}
            <div className="max-h-[480px] overflow-y-auto no-scrollbar">
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font) => (
                  <div
                    key={font}
                    onClick={() => handleFontChange(font)}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors ${
                      settings.fontFamily === font
                        ? isDarkMode
                          ? "bg-stone-800 text-stone-100"
                          : "bg-stone-100 text-stone-900"
                        : isDarkMode
                          ? "hover:bg-stone-800/50 text-stone-300"
                          : "hover:bg-stone-50 text-stone-700"
                    }`}
                    style={{ fontFamily: font }}
                  >
                    <span className="text-sm">{font}</span>
                    {settings.fontFamily === font && (
                      <Check className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-stone-500">
                  No fonts found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FontPicker;
