import React from "react";
import { useState } from "react";
import { X, Minus, Square } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";
import { useEastVoiceContext } from "@/Provider/EastVoice";
import { Settings, MoreHorizontal, FileText } from "lucide-react";

const TitleBar: React.FC = () => {
  const { handleClose, handleMaximize, handleMinimize } = useBibleContext();
  const { setAndSaveCurrentScreen } = useEastVoiceContext();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="h-8 bg-gray-50 dark:bg-bgray flex items-center flex-row-reverse px-4 border-b border-gray-300 dark:border-gray-700 select-none">
      <div className="flex space-x-2 mr-4">
        {/* Close button */}
        <div
          onClick={handleClose}
          className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
        </div>
        {/* Minimize button */}
        <div
          onClick={handleMinimize}
          className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
        >
          <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
        </div>
        {/* Maximize button */}
        <div
          onClick={handleMaximize}
          className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
        >
          <Square className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
        </div>
      </div>
      {/* Title text */}
      <div className="text-sm font-medium flex-1 text-center text-gray-900 dark:text-gray-300">
        Bible 300
      </div>
      <div
        onClick={toggleDropdown}
        className="w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer flex items-center justify-center relative"
        title="More tools"
      >
        <MoreHorizontal className="text-white z-20 size-3" />

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-5 left-0 bg-white shadow-md rounded-md p-1 z-50 w-32">
            <div
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => {
                setAndSaveCurrentScreen("hisvoice");
                setShowDropdown(false);
              }}
            >
              <img src="./icon.png" className="h-4 w-4  text-gray-600" />
              <span className="text-xs">His voice</span>
            </div>
            <div
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => {
                setAndSaveCurrentScreen("Songs");
                setShowDropdown(false);
              }}
            >
              <img src="./music2.png" className="h-4 w-4  text-gray-600" />
              <span className="text-xs">Song app</span>
            </div>
            <div
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => {
                setAndSaveCurrentScreen("bible");
                setShowDropdown(false);
              }}
            >
              <img src="./music3.png" className="h-4 w-4  text-gray-600" />
              <span className="text-xs">Bible</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleBar;
