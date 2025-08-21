import React from "react";
import { TextSelectIcon } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface TextColorSelectorProps {
  onColorChange: (color: string) => void;
}

const TextColorSelector = ({ onColorChange }: TextColorSelectorProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="absolute flex-col items-center gap-10 top-60 left-4">
      {/* First color option */}
      <div
        className={`h-2 w-2 rounded-full mb-5 left-0 hover:scale-105 duration-75 cursor-pointer ${
          isDarkMode ? "bg-[#f9fafb]" : "bg-[#1c1917]"
        }`}
        onClick={() => {
          onColorChange(isDarkMode ? "#fbfaf9" : "#1c1917");
        }}
      >
        <TextSelectIcon
          className={`${
            isDarkMode ? " text-[#f2b084]" : "text-background textst"
          }`}
        />
      </div>

      {/* Second color option */}
      <div
        className={`w-2 h-2 rounded-full mb-2 hover:scale-105 duration-75 cursor-pointer ${
          isDarkMode ? "bg-[#a8a29e]" : "bg-[#57534e]"
        }`}
        onClick={() => {
          onColorChange(isDarkMode ? "#f4d1b9" : "#6c6c6c");
        }}
      >
        <TextSelectIcon
          className={`${isDarkMode ? " text-[#f2b084]" : "text-background "}`}
        />
      </div>
    </div>
  );
};

export default TextColorSelector;
