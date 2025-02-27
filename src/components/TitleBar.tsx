import { useState } from "react";
import {
  ArrowLeftFromLine,
  GalleryThumbnails,
  Group,
  Guitar,
  Minus,
  Square,
  SwitchCamera,
  X,
} from "lucide-react";
import { HomeFilled } from "@ant-design/icons";
import { Switch } from "antd";
import { useEffect } from "react";
import { useBmusicContext } from "@/Provider/Bmusic";

const TitleBar = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { currentScreen, setCurrentScreen, setTheme, theme } =
    useBmusicContext();

  useEffect(() => {
    const savedTheme = localStorage.getItem("bmusictheme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // function to set theme choie
  const setThemeChoice = () => {
    if (theme === "creamy") {
      localStorage.setItem("bmusictheme", "light");
      setTheme("light");
    } else if (theme === "light") {
      localStorage.setItem("bmusictheme", "creamy");
      setTheme("creamy");
    }
  };

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  return (
    <div
      className="h-6 w-screen  fixed w-100 flex z-50 top-0 bg-white/20 bg-opacity-sm backdrop-blur-sm  items-center justify-between px-2 select-none"
      style={{ WebkitAppRegion: "drag" } as any} // Make the entire title bar draggable
    >
      <div className="flex items-center space-x-2 ml-2">
        {/* Control buttons excluded from dragging */}
        <div
          className="flex items-center space-x-2"
          style={{ WebkitAppRegion: "no-drag" } as any} // Exclude control buttons from dragging
        >
          <div
            onClick={handleClose}
            onMouseEnter={() => setIsHovered("close")}
            onMouseLeave={() => setIsHovered(null)}
            className="w-4 h-4 rounded-full bg-[#FF5F57] hover:bg-red-600 hover:cursor-pointer flex items-center justify-center"
          >
            {isHovered === "close" && <X className="text-white z-20 size-3" />}
          </div>
          <div
            onClick={handleMinimize}
            onMouseEnter={() => setIsHovered("minimize")}
            onMouseLeave={() => setIsHovered(null)}
            className="w-4 h-4 rounded-full bg-[#FFBD2E] hover:bg-yellow-600 hover:cursor-pointer flex items-center justify-center"
          >
            {isHovered === "minimize" && (
              <Minus className="text-white z-20 size-3" />
            )}
          </div>
          <div
            onClick={handleMaximize}
            onMouseEnter={() => setIsHovered("maximize")}
            onMouseLeave={() => setIsHovered(null)}
            className="w-4 h-4 rounded-full bg-[#28CA41] hover:bg-green-600 hover:cursor-pointer flex items-center justify-center"
          >
            {isHovered === "maximize" && (
              <Square className="text-white z-20 size-3" />
            )}
          </div>

          <div
            onClick={() => setCurrentScreen("Home")}
            className="w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer flex items-center justify-center"
          >
            <HomeFilled className="text-white z-20 size-3" />
          </div>
          <div
            onClick={setThemeChoice}
            className={`w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer  
              items-center justify-center ${
                currentScreen === "Songs" ? "flex" : "hidden"
              }`}
            title="Mild theme 🟤"
          >
            <SwitchCamera className="text-white z-20 size-3" />
          </div>
          <div
            onClick={() => setCurrentScreen("instRoom")}
            className={`w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer  
              items-center justify-center ${
                currentScreen === "Songs" ? "flex" : "hidden"
              }`}
            title="Instrument showroom 🎸"
          >
            <Guitar className="text-white z-20 size-3" />
          </div>
          <div
            onClick={() => setCurrentScreen("Songs")}
            className={`w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer  
              items-center justify-center ${
                currentScreen === "instRoom" ? "flex" : "hidden"
              }`}
            title="back"
          >
            <ArrowLeftFromLine className="text-white z-20 size-3" />
          </div>
          <div
            onClick={() => setCurrentScreen("categorize")}
            className={`w-4 h-4 rounded-full bg-gray-500 hover:bg-gray-600 hover:cursor-pointer  
              items-center justify-center flex `}
            title="Music categories"
          >
            <Group className="text-white z-20 size-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
