import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Minus,
  Square,
  HeartPulse,
  LucideLibraryBig,
  ClockArrowUp,
  BookmarkCheck,
  CogIcon,
  LucideHome,
} from "lucide-react";
// import { useBibleContext } from "@/Provider/Bible";
// import { useEastVoiceContext } from "@/Provider/EastVoice";
import { MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
// import { useEvPresentationContext } from "@/Provider/EvPresent";
import Help from "@/shared/Help";
import { useSermonContext } from "../Provider/Vsermons";
import { HomeOutlined, HomeTwoTone, ReadFilled } from "@ant-design/icons";
import { Tooltip } from "antd";

const TitleBar: React.FC = () => {
  const {
    handleClose,
    handleMaximize,
    handleMinimize,
    theme,
    activeTab,
    setActiveTab,
  } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedBg, setSelectedBg] = useState<string>('url("./wood2.jpg")');
  const [nextBg, setNextBg] = useState<string>('url("./wood7.png")');
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  // const [selectedPath, setSelectedPath] = useState<string>("");

  const ltImages = [
    'url("./wood2.jpg")',
    'url("./wood10.jpg")',
    'url("./wood11.jpg")',
    'url("./wood7.png")',
    'url("./wood6.jpg")',
  ];

  // check for selectedPath from local storage

  //function choose path an set it to local storage

  const randomImage = useCallback(() => {
    const currentIndex = ltImages.indexOf(selectedBg);
    let newIndex = currentIndex;

    // Ensure we select a different image
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * ltImages.length);
    }

    setNextBg(ltImages[newIndex]);
    // Start transition
    setBgOpacity(0);
  }, [selectedBg]);

  useEffect(() => {
    // Set up interval for image switching
    const intervalId = setInterval(randomImage, 20000); // 5 minutes (300000 ms)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [randomImage]);

  useEffect(() => {
    // When opacity reaches 0, switch background and reset opacity
    if (bgOpacity === 0) {
      const transitionTimer = setTimeout(() => {
        setSelectedBg(nextBg);
        setBgOpacity(1);
      }, 5000); // Matches transition duration

      return () => clearTimeout(transitionTimer);
    }
  }, [bgOpacity, nextBg]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div
      className="z-50 w-screen fixed"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      <div
        className="h-8 flex items-center flex-row-reverse px-4 border-b border-gray-300 dark:border-gray-700 select-none relative"
        style={{
          ...(!isDarkMode
            ? {
                backgroundImage: !isDarkMode
                  ? `linear-gradient(to bottom,
             #ffffff00 0%,
             rgba(255, 255, 255, 5) 60%),
             ${selectedBg}`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "30px", // Adjust size to control repeat pattern
              }
            : {
                backgroundImage: isDarkMode
                  ? `linear-gradient(to bottom,
             rgba(255, 255, 255, 0%) 0%,
             #1c1917ff 60%),
             url(./wood6.jpg)`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "30px", // Adjust size to control repeat pattern
              }),
        }}
      >
        <div
          className=" space-x-2 mr-4 flex items-center justify-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* theme toggler */}
          <ThemeToggle />

          <Help />
          {/* Close button */}

          <Tooltip title="close">
            <div
              onClick={handleClose}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* Minimize button */}

          <Tooltip title="minimize">
            <div
              onClick={handleMinimize}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <Minus className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* Maximize button */}

          <Tooltip title="maximize">
            <div
              onClick={handleMaximize}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <Square className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
        </div>
        {/* Rest of the component remains the same */}
        <div className="text-sm flex-1 text-center text-gray-900 dark:text-gray-300 font-cooper">
          Brother Bob
        </div>
        <div
          className="flex items-center justify-center gap-4"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* home */}

          <Tooltip title="Home">
            <div
              onClick={() => setActiveTab("home")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <LucideHome className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>

          {/* Bookmarks */}

          <Tooltip title="Bookmarks" style={{ fontFamily: "fantasy" }}>
            <div
              onClick={() => setActiveTab("bookmarks")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <BookmarkCheck className="w-4 h-4 text-gray-600 dark:text-[#a8a29e] group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* recents */}

          <Tooltip title="Recents">
            <div
              onClick={() => setActiveTab("recents")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <ClockArrowUp className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* read */}

          <Tooltip title="Sermon">
            <div
              onClick={() => setActiveTab("message")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <ReadFilled className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* sermons */}

          <Tooltip title="sermons">
            <div
              onClick={() => setActiveTab("sermons")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <LucideLibraryBig className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* Home */}

          <Tooltip title="Home">
            <div
              onClick={() => setActiveTab("home")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <HomeOutlined className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>

          <Tooltip title="Settings">
            <div
              onClick={() => setActiveTab("settings")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <CogIcon className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
