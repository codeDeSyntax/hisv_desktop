import React from "react";
import { X, Moon, Sun } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

const SettingsPanel: React.FC = () => {
  const {
    setActiveFeature,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    verseTextColor,
    setVerseTextColor,
  } = useBibleContext();

  return (
    <div className="h-full  p-4 bg-gray-50 dark:bg-black font-serif">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        <button
          onClick={() => setActiveFeature(null)}
          className="p-1 hover:bg-gray-100 hover:cursor-pointer bg-gray-50 shadow  dark:bg-bgray  dark:hover:bg-bgray rounded"
        >
          <X size={20} className="text-gray-900 dark:text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Theme Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Theme
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-2 hover:cursor-pointer px-4 rounded-md flex items-center justify-center ${
                theme === "light"
                  ? "bg-gray-50 dark:bg-bgray focus:outline-none text-stone-500 dark:text-gray-500 border-1 border-stone-500"
                  : "bg-gray-100 dark:bg-bgray  shadow-black text-stone-500 dark:text-gray-50  focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Sun size={18} className="mr-2" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-2 px-4 rounded-md flex items-center hover:cursor-pointer justify-center ${
                theme === "dark"
                  ? "bg-gray-50 dark:bg-bgray text-stone-500 dark:text-gray-500 border-1 border-stone-500 focus:outline-none"
                  : "bg-gray-100 dark:bg-gray-800 focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 shadow"
              }`}
            >
              <Moon size={18} className="mr-2" />
              Dark
            </button>
          </div>
        </div>

        {/* Font Size Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Font Size
          </h3>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-800 rounded-md bg-white dark:bg-bgray focus:outline-none hover:cursor-pointer text-gray-900 dark:text-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xl">Extra Large</option>
            <option value="2xl">XX-Large</option>
          </select>
        </div>

        {/* Font Family Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Font Family
          </h3>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-800 rounded-md bg-white dark:bg-bgray focus:outline-none hover:cursor-pointer text-gray-900 dark:text-white flex flex-col gap-3"
          >
            <option value="serif">Serif</option>
            <option value="sans">Sans-serif</option>
            <option value="mono">Monospace</option>
            <option value="arial">Arial</option>
            <option value="helvetica">Helvetica</option>
            <option value="georgia">Georgia</option>
            <option value="times">Times New Roman</option>
            <option value="courier">Courier New</option>
            <option value="verdana">Verdana</option>
            <option value="impact">Impact</option>
          </select>
        </div>

        {/* Text Color Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Text Color
          </h3>
          <div className="flex items-center">
            <input
              type="color"
              value={verseTextColor}
              onChange={(e) => setVerseTextColor(e.target.value)}
              className="w-8 h-8 focus:outline-none rounded mr-2 cursor-pointer bg-gray-50 dark:bg-bgray"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {verseTextColor}
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            About
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bible 300 - Version 1.0.0
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A simple Bible app with multiple translations and customizable
            reading experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
