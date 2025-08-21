import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Type,
  Eye,
  Palette,
  Check,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

const FontSettingsPage = () => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

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

    // Show save notification
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  // Auto-save when any setting changes
  useEffect(() => {
    const newSettings = {
      fontFamily,
      fontSize: fontSize.toString(),
      fontWeight,
      fontStyle,
    };
    autoSave(newSettings);
  }, [fontFamily, fontSize, fontWeight, fontStyle]);

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-background flex items-center justify-center pt-2">
      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Settings saved automatically
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex items-start justify-center w-[95%] h-[88vh] gap-6 px-6 pb-2">
        {/* Left Panel - Settings Controls (30%) */}
        <div className="w-[30%] h-full flex flex-col relative rounded-3xl bg-white dark:bg-primary/20">
          <div className="backdrop-blur-md bg-white dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full rounded-3xl dark:shadow-[#543915] shadow">
            {/* Header */}
            <div className="flex-shrink-0 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <SettingsIcon className="w-4 h-4 text-amber-600 dark:text-yellow-800" />
                <h2 className="text-base font-semibold text-stone-800 dark:text-text font-zilla">
                  Settings
                </h2>
              </div>
            </div>

            {/* Settings Content - Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
              <div className="px-4 pb-4">
                <div className="space-y-3 font-zilla">
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
                        onChange={(e) =>
                          handleFontSizeChange(Number(e.target.value))
                        }
                        className="w-full h-1 bg-stone-200 dark:bg-amber-900/30 rounded appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #53391b 0%, #4b3114 ${
                            ((fontSize - 12) * 100) / 108
                          }%, #f6d5a4 ${
                            ((fontSize - 12) * 100) / 108
                          }%, #f6d5a4 100%)`,
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
                            onClick={() => setFontWeight(weight.value)}
                            className={`w-full p-1 text-[10px] rounded border transition-all duration-200 ${
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
                            onClick={() => setFontStyle(style.value)}
                            className={`w-full p-1 text-[10px] rounded border transition-all duration-200 ${
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview (30%) */}
        <div className="w-[30%] h-[95%] flex flex-col relative rounded-3xl bg-white dark:bg-primary/20">
          <div className="backdrop-blur-md bg-white dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full rounded-3xl dark:shadow-[#543915] shadow">
            {/* Header */}
            <div className="flex-shrink-0 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-4 h-4 text-amber-600 dark:text-yellow-800" />
                <h2 className="text-base font-semibold text-stone-800 dark:text-text font-zilla">
                  Live Preview
                </h2>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
              <div className="px-4 pb-4">
                <div
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    fontStyle,
                  }}
                  className="text-stone-800 dark:text-text leading-relaxed space-y-4"
                >
                  <h3 className="font-bold text-amber-600 dark:text-yellow-800 border-b border-stone-200 dark:border-amber-900/30 pb-2 mb-4">
                    Sample Sermon Text
                  </h3>
                  <p>
                    The quick brown fox jumps over the lazy dog. This pangram
                    contains every letter of the alphabet and demonstrates how
                    your chosen font will appear.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <p>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 italic opacity-75">
                    "Faith is taking the first step even when you don't see the
                    whole staircase." - Martin Luther King Jr.
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FontSettingsPage;
