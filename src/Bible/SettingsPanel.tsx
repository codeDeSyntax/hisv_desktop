import React, { useState, useRef, useEffect } from "react";
import { X, Moon, Sun, ChevronDown, Check } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
}: {
  options: { value: string; text: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the selected option text
  const selectedOptionText =
    options.find((option) => option.value === value)?.text || placeholder;

  return (
    <div ref={selectRef} className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-bgray text-gray-900 dark:text-white ${className}`}
      >
        <span className="truncate">{selectedOptionText}</span>
        <ChevronDown
          size={18}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } text-gray-500`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-bgray border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto no-scrollbar">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                px-3 py-2 cursor-pointer flex items-center justify-between 
                hover:bg-gray-100 dark:hover:bg-ltgray text-[12px]
                ${
                  value === option.value
                    ? "bg-gray-100 dark:bg-bgray/50 text-primary"
                    : "text-gray-900 dark:text-white"
                }
              `}
            >
              <span className="truncate">{option.text}</span>
              {value === option.value && (
                <Check size={16} className="text-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

  const fontOptions = [
    { value: "'Times New Roman', Times, serif", text: "Times New Roman" },
    { value: "'Arial', sans-serif", text: "Arial" },
    { value: "'Helvetica', sans-serif", text: "Helvetica" },
    { value: "'Courier New', Courier, monospace", text: "Courier New" },
    { value: "'Verdana', sans-serif", text: "Verdana" },
    { value: "'Impact', Charcoal, sans-serif", text: "Impact" },
    { value: "'Georgia', serif", text: "Georgia" },
    { value: "'Monospace', monospace", text: "Monospace" },
    { value: "serif", text: "Serif" },
    { value: "sans-serif", text: "Sans-serif" },
  ];

  const fontSizeOptions = [
    { value: "small", text: "Small" },
    { value: "medium", text: "Medium" },
    { value: "large", text: "Large" },
    { value: "xl", text: "Extra Large" },
    { value: "2xl", text: "XX-Large" },
  ];

  return (
    <div
      className="h-full p-4 bg-gray-50 dark:bg-black font-serif border-none overflow-hidden"
      style={{
        borderRightWidth: 1,
        borderRightColor: theme === "dark" ? "#202020" : "#20202020",
        borderRightStyle: "dashed",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        <button
          onClick={() => setActiveFeature(null)}
          className="p-1 hover:bg-gray-100 hover:cursor-pointer bg-gray-50 shadow dark:bg-bgray dark:hover:bg-bgray rounded"
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
                  : "bg-gray-100 dark:bg-bgray shadow-black text-stone-500 dark:text-gray-50 focus:outline-none hover:bg-gray-200 dark:hover:bg-ltgray"
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
          <CustomSelect
            options={fontSizeOptions}
            value={fontSize}
            onChange={(value) => setFontSize(value)}
          />
        </div>

        {/* Font Family Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Font Family
          </h3>
          <CustomSelect
            options={fontOptions}
            value={fontFamily}
            onChange={(value) => setFontFamily(value)}
          />
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
