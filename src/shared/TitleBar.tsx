import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Minus,
  Square,
  HeartPulse,
  LucideLibraryBig,
  Archive,
  CogIcon,
  LucideHome,
  Settings,
  Mic,
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
import DropdownSettings from "@/components/DropdownSettings";
import { Sermon } from "@/types/index.js";

const TitleBar: React.FC = () => {
  const {
    handleClose,
    handleMaximize,
    handleMinimize,
    theme,
    activeTab,
    setActiveTab,
    selectedMessage,
    recentSermons,
    allSermons,
    setSelectedMessage,
  } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Sermon tabs state
  const [openTabs, setOpenTabs] = useState<Sermon[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Load persisted tabs on component mount
  useEffect(() => {
    const savedTabs = localStorage.getItem("openSermonTabs");
    const savedActiveTabId = localStorage.getItem("activeSermonTabId");

    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setOpenTabs(parsedTabs);

        if (savedActiveTabId) {
          setActiveTabId(savedActiveTabId);
        }
      } catch (error) {
        console.error("Error loading saved tabs:", error);
        // Clear corrupted data
        localStorage.removeItem("openSermonTabs");
        localStorage.removeItem("activeSermonTabId");
      }
    }
  }, []);

  // Persist tabs whenever they change
  useEffect(() => {
    if (openTabs.length > 0) {
      localStorage.setItem("openSermonTabs", JSON.stringify(openTabs));
    } else {
      localStorage.removeItem("openSermonTabs");
    }
  }, [openTabs]);

  // Persist active tab ID whenever it changes
  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem("activeSermonTabId", activeTabId);
    } else {
      localStorage.removeItem("activeSermonTabId");
    }
  }, [activeTabId]);

  const [selectedBg, setSelectedBg] = useState<string>('url("./wood6.jpg")');
  const [nextBg, setNextBg] = useState<string>('url("./wood7.png")');
  const [bgOpacity, setBgOpacity] = useState<number>(1);
  // const [selectedPath, setSelectedPath] = useState<string>("");

  const ltImages = ['url("./wood7.png")', 'url("./wood6.jpg")'];

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

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsDropdown]);

  // Load tabs from localStorage on mount
  useEffect(() => {
    const savedTabs = localStorage.getItem("sermonTabs");
    const savedActiveTab = localStorage.getItem("activeSermonTab");
    if (savedTabs) {
      try {
        const tabs = JSON.parse(savedTabs);
        setOpenTabs(tabs);
      } catch (error) {
        console.error("Error loading saved tabs:", error);
      }
    }
    if (savedActiveTab) {
      setActiveTabId(savedActiveTab);
    }
  }, []);

  // Save tabs to localStorage when tabs change
  useEffect(() => {
    localStorage.setItem("sermonTabs", JSON.stringify(openTabs));
  }, [openTabs]);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem("activeSermonTab", activeTabId);
    }
  }, [activeTabId]);

  // Add sermon to tabs when selectedMessage changes
  useEffect(() => {
    if (selectedMessage && activeTab === "message") {
      addSermonTab(selectedMessage);
    }
  }, [selectedMessage, activeTab]);

  // Tab management functions
  const addSermonTab = (sermon: Sermon) => {
    setOpenTabs((prevTabs) => {
      // Check if tab already exists
      const existingIndex = prevTabs.findIndex((tab) => tab.id === sermon.id);
      if (existingIndex !== -1) {
        // Move existing tab to the end and set as active
        const newTabs = [...prevTabs];
        const existingTab = newTabs.splice(existingIndex, 1)[0];
        newTabs.push(existingTab);
        setActiveTabId(sermon.id.toString());
        return newTabs;
      }

      // Add new tab
      const newTabs = [...prevTabs, sermon];

      // Limit to 7 tabs (remove oldest if necessary)
      if (newTabs.length > 7) {
        newTabs.shift(); // Remove first (oldest) tab
      }

      setActiveTabId(sermon.id.toString());
      return newTabs;
    });
  };

  const closeSermonTab = (
    sermonId: string | number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    setOpenTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.id !== sermonId);

      // If we closed the active tab, set a new active tab
      if (activeTabId === sermonId.toString()) {
        if (newTabs.length > 0) {
          // Set the last tab as active
          const newActiveTab = newTabs[newTabs.length - 1];
          setActiveTabId(newActiveTab.id.toString());
          setSelectedMessage(newActiveTab);
        } else {
          // No tabs left, go back to sermons list
          setActiveTabId(null);
          setSelectedMessage(null);
          setActiveTab("sermons");
        }
      }

      return newTabs;
    });
  };

  const switchToTab = (sermon: Sermon) => {
    setActiveTabId(sermon.id.toString());

    // Try to get the most complete sermon data available
    const fullSermon = findSermonById(sermon.id) || sermon;
    setSelectedMessage(fullSermon);

    if (activeTab !== "message") {
      setActiveTab("message");
    }
  };

  // Function to find sermon by ID from all available sermons
  const findSermonById = (sermonId: string | number) => {
    // First check recentSermons
    let foundSermon = recentSermons.find(
      (s) => s.id.toString() === sermonId.toString()
    );

    // If not found in recents, check all sermons (if available in context)
    if (!foundSermon && allSermons) {
      foundSermon = allSermons.find(
        (s) => s.id.toString() === sermonId.toString()
      );
    }

    return foundSermon;
  };

  // Clean up stale tabs (sermons that no longer exist)
  const cleanupStaleTabs = () => {
    setOpenTabs((prevTabs) => {
      const validTabs = prevTabs.filter((tab) => {
        const foundSermon = findSermonById(tab.id);
        return foundSermon !== undefined;
      });

      // If the active tab was removed, reset active state
      if (
        activeTabId &&
        !validTabs.find((tab) => tab.id.toString() === activeTabId)
      ) {
        setActiveTabId(null);
        setSelectedMessage(null);
      }

      return validTabs;
    });
  };

  // Cleanup stale tabs when sermon data changes
  useEffect(() => {
    if (openTabs.length > 0) {
      cleanupStaleTabs();
    }
  }, [allSermons, recentSermons]);

  // Restore active tab from persisted data when component mounts
  useEffect(() => {
    if (activeTabId && !selectedMessage && openTabs.length > 0) {
      const activeTab = openTabs.find(
        (tab) => tab.id.toString() === activeTabId
      );
      if (activeTab) {
        // Check if we have full sermon data or need to fetch it
        const fullSermon = findSermonById(activeTab.id);
        if (fullSermon) {
          setSelectedMessage(fullSermon);
          setActiveTab("message");
        } else {
          // Use the tab data we have (should be sufficient for basic display)
          setSelectedMessage(activeTab);
          setActiveTab("message");
        }
      }
    }
  }, [activeTabId, openTabs, allSermons, recentSermons]);

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
             rgba(255, 255, 255, 5) 50%),
             ${selectedBg}`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "15px", // Adjust size to control repeat pattern
              }
            : {
                backgroundImage: isDarkMode
                  ? `linear-gradient(to bottom,
             rgba(255, 255, 255, 0%) 0%,
             #1c1917ff 50%),
             ${selectedBg}`
                  : undefined,
                backgroundRepeat: "repeat",
                backgroundSize: "15px", // Adjust size to control repeat pattern
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
          <div ref={settingsRef} className="relative">
            <Tooltip title="Settings">
              <div
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
              </div>
            </Tooltip>

            {showSettingsDropdown && (
              <DropdownSettings
                isOpen={showSettingsDropdown}
                onClose={() => setShowSettingsDropdown(false)}
                position={{ top: 40, right: 40 }}
              />
            )}
          </div>
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
        {/* Middle section - Show tabs when viewing sermons, otherwise show app name */}
        <div
          className="flex-1 flex items-center justify-center px-4 min-w-0 h-full"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {activeTab === "message" && openTabs.length > 0 ? (
            // Chrome-like tabs with horizontal scrolling
            <div className="flex-1 max-w-full min-w-0 flex items-center justify-center">
              <div
                className="flex items-center gap-1 overflow-x-auto no-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {openTabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    onClick={() => switchToTab(tab)}
                    className={`relative flex items-center gap-2 px-3  rounded-lg cursor-pointer transition-all backdrop-blur-sm duration-200 flex-shrink-0 w-[100px] min-w-[120px] group h-6 ${
                      activeTabId === tab.id.toString()
                        ? " from-text border-t border-l border-r border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100"
                        : " hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300"
                    }`}
                    style={
                      {
                        WebkitAppRegion: "no-drag" as any,
                        clipPath:
                          activeTabId === tab.id.toString()
                            ? "polygon(0 100%, 0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% 100%)"
                            : "polygon(0 100%, 0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% 100%)",
                      } as React.CSSProperties
                    }
                  >
                    {/* Audio indicator - absolute positioned */}
                    {tab.audioUrl && (
                      <div className="absolute top-1 right-0 transform translate-y-[-2px]">
                        <div className="w-3 h-3 bg-yellow-700 dark:bg-yellow-700 rounded-full flex items-center justify-center">
                          <Mic className="w-2 h-2 text-white " />
                        </div>
                      </div>
                    )}

                    {/* Tab content */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          activeTabId === tab.id.toString()
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-stone-400 dark:bg-stone-500"
                        }`}
                      />
                      <span
                        className="text-xs font-medium truncate"
                        title={tab.title}
                      >
                        {tab.title}
                      </span>
                    </div>

                    {/* Close button */}
                    <span
                      onClick={(e) => closeSermonTab(tab.id, e)}
                      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        activeTabId === tab.id.toString()
                          ? "hover:bg-stone-200 dark:hover:bg-stone-600"
                          : "hover:bg-stone-300 dark:hover:bg-stone-500"
                      } opacity-0 group-hover:opacity-100`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Default app name
            <div className="text-sm text-center text-gray-900 dark:text-gray-300 font-cooper">
              Brother Bob
            </div>
          )}
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
              <img
                src="./hisv.png"
                className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white"
              />
            </div>
          </Tooltip>

          {/* Bookmarks & Recents Combined */}

          <Tooltip title="Library" style={{ fontFamily: "fantasy" }}>
            <div
              onClick={() => setActiveTab("library")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <Archive className="w-4 h-4 text-gray-600 dark:text-[#a8a29e] group-hover:text-black dark:group-hover:text-white" />
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

          {/* <Tooltip title="Home">
            <div
              onClick={() => setActiveTab("home")}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-primary"
            >
              <HomeOutlined className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip> */}
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
