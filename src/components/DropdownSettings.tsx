import React, { useState, useEffect, useRef } from "react";
import {
  Settings as SettingsIcon,
  Type,
  Eye,
  Palette,
  Check,
  Monitor,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; right: number };
}

const DropdownSettings: React.FC<DropdownSettingsProps> = ({
  isOpen,
  onClose,
  position,
}) => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Local state for live updates
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);

  const fontFamilies = [
    "Arial Black",
    "Serif",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Trebuchet MS",
    "cursive",
  ];

  // Auto-save functionality
  const autoSave = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem("sermonSettings", JSON.stringify(newSettings));

    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 1500);
  };

  // Auto-save when any setting changes
  useEffect(() => {
    const newSettings = {
      ...settings,
      fontFamily,
      fontSize: fontSize.toString(),
      fontWeight,
      fontStyle,
    };
    autoSave(newSettings);
  }, [fontFamily, fontSize, fontWeight, fontStyle]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle setting changes
  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  const handleFontWeightChange = (weight: string) => {
    setFontWeight(weight);
  };

  const handleFontStyleChange = (style: string) => {
    setFontStyle(style);
  };

  // Current settings display
  const renderMainView = () => (
    <>
      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-stone-50 to-stone-100 dark:from-amber-950/50 dark:to-stone-900/80 rounded-md border border-stone-200 dark:border-amber-900/40">
        <div className="flex items-center gap-2">
          <Palette className="w-3 h-3 text-amber-600 dark:text-yellow-800" />
          <h3 className="font-medium text-stone-700 dark:text-orange-200 text-xs">
            Theme
          </h3>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            isDarkMode ? "bg-amber-600" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
              isDarkMode ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Type className="w-3 h-3 text-amber-600 dark:text-yellow-800" />
          <h3 className="font-medium text-stone-700 dark:text-orange-200 text-xs">
            Font Family
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {fontFamilies.map((font) => (
            <button
              key={font}
              onClick={() => handleFontFamilyChange(font)}
              className={`px-3 py-1.5 text-[10px] rounded-full border transition-all duration-200 ${
                fontFamily === font
                  ? "bg-gradient-to-r from-amber-50/80 to-stone-50/80 dark:from-yellow-950/80 dark:to-yellow-900/80 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-text"
                  : "bg-white dark:bg-yellow-800/20 border-stone-200 dark:border-amber-900/30 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-primary/30"
              }`}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-amber-600 dark:text-yellow-800" />
          <h3 className="font-medium text-stone-700 dark:text-orange-200 text-xs">
            Size:{" "}
            <span className="text-amber-600 dark:text-yellow-800">
              {fontSize}px
            </span>
          </h3>
        </div>
        <div>
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="w-full h-1 bg-stone-200 dark:bg-amber-900/30 rounded appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #53391b 0%, #4b3114 ${
                ((fontSize - 12) * 100) / 108
              }%, #f6d5a4 ${((fontSize - 12) * 100) / 108}%, #f6d5a4 100%)`,
            }}
          />
        </div>
      </div>

      {/* Font Weight & Style - Combined Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Font Weight */}
        <div className="space-y-2">
          <h3 className="font-medium text-stone-700 dark:text-orange-200 text-xs">
            Weight
          </h3>
          <div className="flex flex-col gap-1">
            {[
              { value: "normal", label: "Normal" },
              { value: "bold", label: "Bold" },
            ].map((weight) => (
              <div
                key={weight.value}
                onClick={() => handleFontWeightChange(weight.value)}
                className={`w-full p-1 text-[10px] rounded border transition-all duration-200 cursor-pointer ${
                  fontWeight === weight.value
                    ? "bg-gradient-to-r from-amber-50/80 to-stone-50/80 dark:from-amber-950/20 dark:to-stone-900/20 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-text"
                    : "bg-white dark:bg-primary/20 border-stone-200 dark:border-amber-900/30 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-primary/30"
                }`}
                style={{ fontWeight: weight.value }}
              >
                {weight.label}
              </div>
            ))}
          </div>
        </div>

        {/* Font Style */}
        <div className="space-y-1">
          <h3 className="font-medium text-stone-700 dark:text-orange-200 text-xs">
            Style
          </h3>
          <div className="flex flex-col gap-1">
            {[
              { value: "normal", label: "Normal" },
              { value: "italic", label: "Italic" },
            ].map((style) => (
              <div
                key={style.value}
                onClick={() => handleFontStyleChange(style.value)}
                className={`w-full p-1 text-[10px] rounded border transition-all duration-200 cursor-pointer ${
                  fontStyle === style.value
                    ? "bg-gradient-to-r from-amber-50/80 to-stone-50/80 dark:from-amber-950/20 dark:to-stone-900/20 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-text"
                    : "bg-white dark:bg-primary/20 border-stone-200 dark:border-amber-900/30 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-primary/30"
                }`}
                style={{ fontStyle: style.value }}
              >
                {style.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 rounded-3xl bg-white dark:bg-primary/20"
            style={{
              top: position.top,
              right: position.right,
              width: "25vw",
              //   minWidth: "400px",
              //   maxWidth: "500px",
              //   height: "80vh",
              maxHeight: "600px",
            }}
          >
            <div className="backdrop-blur-md bg-white dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full rounded-3xl dark:shadow-[#543915] shadow">
              {/* Header */}
              <div className="flex-shrink-0 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-amber-600 dark:text-yellow-800" />
                    <h2 className="text-base font-semibold text-stone-800 dark:text-text font-zilla">
                      Settings
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-stone-200 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-stone-600 dark:text-amber-300" />
                  </button>
                </div>
              </div>

              {/* Settings Content - Scrollable */}
              <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
                <div className="px-4 pb-4">
                  <div className="space-y-3 font-zilla">{renderMainView()}</div>
                </div>
              </div>
            </div>

            {/* Save Notification */}
            <AnimatePresence>
              {showSaveNotification && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-4 right-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Settings saved automatically
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DropdownSettings;
