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
  Mic,
  Presentation,
  PlaySquare,
} from "lucide-react";
// import { useBibleContext } from "@/Provider/Bible";
// import { useEastVoiceContext } from "@/Provider/EastVoice";
import { MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
// import { useEvPresentationContext } from "@/Provider/EvPresent";
import Help from "@/shared/Help";
import UpdateManager from "@/shared/UpdateManager";
import FontPicker from "@/components/FontPicker";
import { useSermonContext } from "../Provider/Vsermons";
import { HomeOutlined, HomeTwoTone, ReadFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import { Sermon } from "@/types/index.js";

const TitleBar: React.FC = () => {
  const {
    handleClose,
    handleMaximize,
    handleMinimize,
    isPresentationMode,
    setIsPresentationMode,
    theme,
    activeTab,
    setActiveTab,
    selectedMessage,
    recentSermons,
    allSermons,
    setSelectedMessage,
  } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

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
    event: React.MouseEvent,
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
      (s) => s.id.toString() === sermonId.toString(),
    );

    // If not found in recents, check all sermons (if available in context)
    if (!foundSermon && allSermons) {
      foundSermon = allSermons.find(
        (s) => s.id.toString() === sermonId.toString(),
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
        (tab) => tab.id.toString() === activeTabId,
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
    <div className="z-50 w-screen " style={{ WebkitAppRegion: "drag" } as any}>
      <div className="h-[5vh] flex items-center justify-between px-4  border-b border-zinc-200 dark:border-zinc-700 select-none relative bg-zinc-950 ">
        {/* Left section - Current Sermon Tab + Recent Sermons */}
        <div
          className="flex items-center gap-1 flex-shrink-0 min-w-0"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Current Sermon Tab - Always shown if a sermon is selected */}
          {selectedMessage && activeTab === "message" && (
            <div
              key={`current-${selectedMessage.id}`}
              className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-t-lg cursor-default flex-shrink-0 max-w-[160px] min-w-[100px] group h-[85%] bg-white dark:bg-zinc-800 border-t-2 border-l border-r border-l-zinc-400 border-r-zinc-400 dark:border-l-zinc-500 dark:border-r-zinc-500 text-zinc-900 dark:text-zinc-100 shadow-md"
              style={{ borderTopColor: accentColor }}
              title={selectedMessage.title}
            >
              {/* Active indicator dot - pulsing */}
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-600 dark:bg-green-500" />

              {/* Sermon title */}
              <span className="text-[10px] font-semibold truncate flex-1">
                {selectedMessage.title.length > 20
                  ? selectedMessage.title.substring(0, 20) + "..."
                  : selectedMessage.title}
              </span>

              {/* Audio indicator if available */}
              {selectedMessage.audioUrl && (
                <div className="flex-shrink-0">
                  <Mic className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          )}

          {/* Separator between current and recent */}
          {selectedMessage &&
            activeTab === "message" &&
            recentSermons.length > 0 && (
              <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1" />
            )}

          {/* Recent Sermons Tabs (max 4, excluding current) */}
          {recentSermons
            .slice(0, 4)
            .filter((sermon) => sermon.id !== selectedMessage?.id)
            .map((sermon, index) => (
              <div
                key={sermon.id}
                onClick={() => {
                  setSelectedMessage(sermon);
                  setActiveTab("message");
                  // Add to open tabs if not already there
                  const existingTab = openTabs.find((t) => t.id === sermon.id);
                  if (!existingTab) {
                    setOpenTabs((prev) => [...prev, sermon]);
                  }
                  setActiveTabId(sermon.id.toString());
                }}
                className="relative flex items-center gap-1.5 px-2 py-1 rounded-t-lg cursor-pointer flex-shrink-0 max-w-[140px] min-w-[100px] group h-[85%] bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                title={sermon.title}
              >
                {/* Indicator dot */}
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-zinc-400 dark:bg-zinc-600" />

                {/* Sermon title */}
                <span className="text-[10px] font-medium truncate flex-1">
                  {sermon.title.length > 20
                    ? sermon.title.substring(0, 20) + "..."
                    : sermon.title}
                </span>

                {/* Audio indicator if available */}
                {sermon.audioUrl && (
                  <div className="flex-shrink-0">
                    <Mic className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Middle section - App name or active sermon info */}
        <div className="flex-1 flex items-center justify-center px-4 min-w-0">
          <div className="text-sm text-center text-zinc-900 dark:text-zinc-300 font-cooper">
            Brother Bob
          </div>
        </div>

        {/* Right section - Controls */}
        <div
          className="space-x-2 flex items-center justify-center flex-shrink-0"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Font picker */}
          <FontPicker />

          {/* presentation mode toggle */}
          <Tooltip
            title={isPresentationMode ? "Exit Presentation" : "Present Mode"}
          >
            <div
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-zinc-50 dark:hover:bg-primary"
            >
              <PlaySquare
                className={`w-4 h-4 transition-colors ${
                  isPresentationMode
                    ? "text-zinc-600 dark:text-zinc-300"
                    : "text-zinc-600 dark:text-accent"
                } group-hover:text-black dark:group-hover:text-white`}
              />
            </div>
          </Tooltip>

          {/* theme toggler */}
          <ThemeToggle />

          <Help />

          <UpdateManager />

          {/* Close button */}

          <Tooltip title="close">
            <div
              onClick={handleClose}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-zinc-50 dark:hover:bg-primary"
            >
              <X className="w-4 h-4 text-zinc-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* Minimize button */}

          <Tooltip title="minimize">
            <div
              onClick={handleMinimize}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-zinc-50 dark:hover:bg-primary"
            >
              <Minus className="w-4 h-4 text-zinc-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
          {/* Maximize button */}

          <Tooltip title="maximize">
            <div
              onClick={handleMaximize}
              className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-zinc-50 dark:hover:bg-primary"
            >
              <Square className="w-4 h-4 text-zinc-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
