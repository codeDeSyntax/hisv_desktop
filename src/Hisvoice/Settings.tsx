import { useState, useContext, useEffect } from "react";
import { ChevronDown, Check, Settings, Save } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";

const FontSettingsPage = () => {
  const { settings, setSettings } = useSermonContext();
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fontFamilies = [
    "Arial", "Serif", "Helvetica", "Times New Roman", "Courier New",
    "Verdana", "Georgia", "Palatino", "Garamond", "Bookman",
    "Comic Sans MS", "Trebuchet MS", "Arial Black", "Impact", "cursive",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && event.target && !(event.target as Element).closest(".font-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const saveSettings = () => {
    const newSettings = { fontFamily, fontSize: fontSize.toString(), fontWeight, fontStyle };
    setSettings(newSettings);
    localStorage.setItem("sermonSettings", JSON.stringify(newSettings));
    setIsModalVisible(true);
  };

  const handleModalOk = () => setIsModalVisible(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white bg-opacity-10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Left Panel - Controls */}
            <div className="md:col-span-2 bg-white bg-opacity-5 p-8 space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Settings className="text-white w-8 h-8" />
                <h1 className="text-3xl font-bold text-white flex-grow">Font Settings</h1>
              </div>

              {/* Font Family Dropdown */}
              <div className="relative font-dropdown group">
                <label className="text-white text-sm font-medium mb-2 block opacity-80">
                  Font Family
                </label>
                <div
                  className="flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-xl cursor-pointer hover:bg-opacity-20 transition-all duration-300 group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-white truncate mr-2">{fontFamily}</span>
                  <ChevronDown className="text-white opacity-60 group-hover:rotate-180 transition-transform" size={20} />
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-secondary rounded-xl shadow-2xl max-h-64 overflow-auto animate-fade-in">
                    {fontFamilies.map((font) => (
                      <div
                        key={font}
                        className="p-3 hover:bg-white hover:bg-opacity-20 cursor-pointer flex items-center justify-between text-white transition-all duration-200"
                        onClick={() => {
                          setFontFamily(font);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span style={{ fontFamily: font }} className="truncate">{font}</span>
                        {font === fontFamily && <Check size={16} className="text-accent" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Font Size Slider */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium block opacity-80">
                  Font Size: <span className="font-bold">{fontSize}px</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-white bg-opacity-20 outline-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.8) ${((fontSize - 12) * 100) / 108}%, rgba(255,255,255,0.2) ${((fontSize - 12) * 100) / 108}%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-white opacity-60 mt-2">
                    <span>12px</span>
                    <span>120px</span>
                  </div>
                </div>
              </div>

              {/* Font Weight */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium block opacity-80">
                  Font Weight
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["normal", "bold"].map((weight) => (
                    <label
                      key={weight}
                      className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                        fontWeight === weight
                          ? "bg-white bg-opacity-30 ring-2 ring-accent"
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
                      <span className="text-white group-hover:scale-105 transition-transform">
                        {weight.charAt(0).toUpperCase() + weight.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Font Style */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium block opacity-80">
                  Font Style
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["normal", "italic"].map((style) => (
                    <label
                      key={style}
                      className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                        fontStyle === style
                          ? "bg-white bg-opacity-30 ring-2 ring-accent"
                          : "bg-white bg-opacity-10 hover:bg-opacity-20"
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
                      <span className="text-white group-hover:scale-105 transition-transform">
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                className="w-full py-4 mt-6 bg-gradient-to-r from-accent to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>Save Settings</span>
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="md:col-span-3 p-8 bg-white bg-opacity-5">
              <div className="flex items-center space-x-4 mb-6">
                <h2 className="text-2xl font-semibold text-white flex-grow">Live Preview</h2>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 md:p-8 h-[500px] overflow-auto">
                <div
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    fontStyle,
                  }}
                  className="text-white space-y-6"
                >
                  <p className="leading-relaxed">
                    The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, 
                    consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore 
                    et dolore magna aliqua.
                  </p>
                  <p className="leading-relaxed">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white bg-opacity-20 backdrop-blur-xl text-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center">
              <Check className="text-accent w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-center">Settings Saved</h2>
              <p className="mb-6 text-center opacity-80">
                Your font settings have been saved successfully!
              </p>
              <button
                onClick={handleModalOk}
                className="w-full py-3 bg-gradient-to-r from-accent to-purple-600 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSettingsPage;