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
  ChevronDown,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

const FontSettingsPage = () => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Expanded state for dropdowns
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
      ...settings,
      fontSize: fontSize.toString(),
      fontWeight,
      fontStyle,
    };
    autoSave(newSettings);
  }, [fontSize, fontWeight, fontStyle]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="h-full w-full bg-white dark:bg-primary/70 overflow-hidden">
      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed top-20 right-8 z-50 bg-white dark:bg-stone-800 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-stone-700 dark:text-stone-400" />
          <span className="text-sm text-stone-900 dark:text-white">Saved</span>
        </div>
      )}

      {/* Main Container */}
      <div className="h-full w-full overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto py-6 px-6">
          {/* Header */}
          <div className="mb-8 px-2">
            <h1 className="text-3xl font-semibold text-stone-900 dark:text-white">
              Settings
            </h1>
          </div>

          {/* Settings List - Windows 11 Style with soft design */}
          <div className="space-y-1">
            {/* Appearance */}
            <div className="bg-gray-50 dark:bg-stone-900/50 hover:bg-gray-100 dark:hover:bg-stone-800/70 transition-colors rounded-xl">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  </div>
                  <div>
                    <div className="text-[15px] font-medium text-stone-900 dark:text-white">
                      Appearance
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      {isDarkMode ? "Dark mode" : "Light mode"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-5 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? "bg-stone-700" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      isDarkMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="bg-gray-50 dark:bg-stone-900/50 hover:bg-gray-100 dark:hover:bg-stone-800/70 transition-colors rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("fontSize")}
                className="w-full px-5 py-4 bg-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[15px] font-medium text-stone-900 dark:text-white">
                        Font size
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        {fontSize}px
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 dark:text-stone-500 transition-transform ${
                      expandedSection === "fontSize" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {expandedSection === "fontSize" && (
                <div className="px-5 pb-4 pt-2 border-t border-stone-200 dark:border-stone-700">
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={fontSize}
                    onChange={(e) =>
                      handleFontSizeChange(Number(e.target.value))
                    }
                    className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "#57534e" }}
                  />
                  <div className="flex justify-between mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <span>Small (12px)</span>
                    <span>Large (120px)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Text Style */}
            <div className="bg-gray-50 dark:bg-stone-900/50 hover:bg-gray-100 dark:hover:bg-stone-800/70 transition-colors rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("textStyle")}
                className="w-full px-5 py-4 bg-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <Type className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-[15px] font-medium text-stone-900 dark:text-white">
                        Text style
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        {fontWeight} • {fontStyle}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 dark:text-stone-500 transition-transform ${
                      expandedSection === "textStyle" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {expandedSection === "textStyle" && (
                <div className="px-5 pb-4 pt-2 border-t border-stone-200 dark:border-stone-700">
                  <div className="space-y-3">
                    {/* Weight */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
                        Weight
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: "normal", label: "Normal" },
                          { value: "bold", label: "Bold" },
                        ].map((weight) => (
                          <button
                            key={weight.value}
                            onClick={() => setFontWeight(weight.value)}
                            className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                              fontWeight === weight.value
                                ? "bg-stone-700 dark:bg-stone-600 text-white shadow-md"
                                : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/50 border border-stone-200 dark:border-stone-700"
                            }`}
                            style={{ fontWeight: weight.value }}
                          >
                            {weight.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Style */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
                        Style
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: "normal", label: "Normal" },
                          { value: "italic", label: "Italic" },
                        ].map((style) => (
                          <button
                            key={style.value}
                            onClick={() => setFontStyle(style.value)}
                            className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                              fontStyle === style.value
                                ? "bg-stone-700 dark:bg-stone-600 text-white shadow-md"
                                : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/50 border border-stone-200 dark:border-stone-700"
                            }`}
                            style={{ fontStyle: style.value }}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-stone-900/50 hover:bg-gray-100 dark:hover:bg-stone-800/70 transition-colors rounded-xl">
              <div className="px-5 py-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5 text-stone-700 dark:text-stone-400" />
                  </div>
                  <div>
                    <div className="text-[15px] font-medium text-stone-900 dark:text-white">
                      Preview
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      See how your text will look
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-stone-950 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
                  <div
                    style={{
                      fontFamily: settings.fontFamily,
                      fontSize: `${fontSize}px`,
                      fontWeight,
                      fontStyle,
                    }}
                    className="text-stone-900 dark:text-white leading-relaxed space-y-3"
                  >
                    <p>
                      The quick brown fox jumps over the lazy dog. This pangram
                      contains every letter of the alphabet.
                    </p>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
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
