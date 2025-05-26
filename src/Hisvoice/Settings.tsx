import { useState, useContext, useEffect } from "react";
import { ChevronDown, Check, Settings, Save, Sun, Moon } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";

const FontSettingsPage = () => {
  const { settings, setSettings, theme, setTheme } = useSermonContext();
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fontFamilies = [
    "Arial",
    "Serif",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
    "cursive",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        event.target &&
        !(event.target as Element).closest(".font-dropdown")
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const saveSettings = () => {
    const newSettings = {
      fontFamily,
      fontSize: fontSize.toString(),
      fontWeight,
      fontStyle,
    };
    setSettings(newSettings);
    localStorage.setItem("sermonSettings", JSON.stringify(newSettings));
    setIsModalVisible(true);
  };

  const handleModalOk = () => setIsModalVisible(false);

  return (
    <div className="h-screen bg-white dark:bg-background font-serif flex items-center justify-center p-4">
      <div className=" h-[90%] mx-auto max-w-6xl">
        <div className=" rounded-3xl shadow-2xl overflow-scroll no-scrollbar h-full">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Left Panel - Controls */}
            <div className="md:col-span-2 bg-white dark:bg-background bg-opacity-5 p-8 space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Settings className="text-stone-500  dark:text-white w-8 h-8" />
                <h1 className="text-3xl font-bold text-stone-500 dark:text-white flex-grow">
                  Font Settings
                </h1>
              </div>

              {/* Font Family Dropdown */}
              <div className="relative font-dropdown group ">
                <label className="text-stone-500 dark:text-white text-sm font-medium mb-2 block opacity-80">
                  Font Family
                </label>
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-primary bg-opa0 rounded-xl cursor-pointer hover:bg-opacity-20 transition-all duration-300 group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-stone-500 dark:text-white truncate mr-2">
                    {fontFamily}
                  </span>
                  <ChevronDown
                    className="text-stone-500 dark:text-white opacity-60 group-hover:rotate-180 transition-transform"
                    size={20}
                  />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-background  no-scrollbar rounded-xl shadow-2xl max-h-64 overflow-auto animate-fade-in">
                    {fontFamilies.map((font) => (
                      <div
                        key={font}
                        className="p-3 hover:bg-white hover:bg-opacity-20 cursor-pointer flex items-center justify-between text-stone-500 dark:text-white transition-all duration-200"
                        onClick={() => {
                          setFontFamily(font);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span style={{ fontFamily: font }} className="truncate">
                          {font}
                        </span>
                        {font === fontFamily && (
                          <Check size={16} className="text-accent" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Size Slider */}
              <div className="space-y-3">
                <label className="text-stone-500 dark:text-white text-sm font-medium block opacity-80">
                  Font Size: <span className="font-bold">{fontSize}px</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearnce-none bg-primary bg-opacit-20 outline-none cursor-pointer slider"
                    style={{
                      // background: `linear-gradient(to right, rgba(255,255,255,0.8) ${
                      //   ((fontSize - 12) * 100) / 108
                      // }%, rgba(255,255,255,0.2) ${
                      //   ((fontSize - 12) * 100) / 108
                      // }%)`,
                      background: "#202020",
                    }}
                  />
                  <div className="flex justify-between text-[12px] text-stone-500 dark:text-white opacity-60 mt-2">
                    <span>12px</span>
                    <span>120px</span>
                  </div>
                </div>
              </div>

              {/* Font Weight */}
              <div className="space-y-3">
                <label className="text-stone-500 dark:text-white text-[12px] font-medium block opacity-80">
                  Font Weight
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["normal", "bold"].map((weight) => (
                    <label
                      key={weight}
                      className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                        fontWeight === weight
                          ? "bg-white bg-opacity-30 ring-2 ring-primary/30"
                          : "bg-white bg-opacity-10 hover:bg-opacity-20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="fontWeight"
                        value={weight}
                        checked={fontWeight === weight}
                        onChange={(e) => setFontWeight(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-stone-500 dark:text-white group-hover:scale-105 transition-transform">
                        {weight.charAt(0).toUpperCase() + weight.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Font Style */}
              <div className="space-y-3">
                <label className="text-stone-500 dark:text-white text-sm font-medium block opacity-80">
                  Font Style
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["normal", "italic"].map((style) => (
                    <label
                      key={style}
                      className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300 group font-serif ${
                        fontStyle === style
                          ? "bg-white bg-opacity-30 ring-2 ring-primary/20 "
                          : "bg-white bg-opacity-10 hover:bg-opacity-20 shadow"
                      }`}
                    >
                      <input
                        type="radio"
                        name="fontStyle"
                        value={style}
                        checked={fontStyle === style}
                        onChange={(e) => setFontStyle(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-stone-500 dark:text-white group-hover:scale-105 transition-transform">
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                className="w-full py-4 mt-6 bg-gray-100  text-stone-500 dark:bg-primary dark:text-gray-50 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:primary/40 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>Save Settings</span>
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="md:col-span-3 p-8 bg-white bg-opacity-5 ">
              <div className="flex items-center space-x-4 mb-6">
                <h2 className="text-xl font-semibold text-stone-500 dark:text-white flex-grow">
                  Live Preview
                </h2>
              </div>
              <div className=" rounded-2xl p-6 md:p-8 h-[500px] overflow-y-scroll no-scrollbar">
                <div
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    fontStyle,
                  }}
                  className="text-stone-500 dark:text-white space-y-6"
                >
                  <p className="leading-relaxed">
                    The quick brown fox jumps over the lazy dog. Lorem ipsum
                    dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <p className="leading-relaxed">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-gray-700/30 transform animate-pulse">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="text-green-600 dark:text-green-400 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Configuration Saved
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Your font settings have been applied successfully!
              </p>
              <button
                onClick={handleModalOk}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] text-sm"
              >
                Perfect!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSettingsPage;
