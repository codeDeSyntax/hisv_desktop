import { useEffect, useMemo, useState, useCallback, memo, useRef } from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/Provider/Theme";
import { Tooltip } from "antd";
import {
  BookOpen,
  Settings,
  Bookmark,
  ChevronRight,
  Home as HomeIcon,
  Search as SearchIcon,
  Clock,
} from "lucide-react";

// Lazy load heavy components for better initial performance

import SermonList from "./Allsermons";
import SelectedSermon from "./SelectedSermon";
import ModularBookmarks from "@/components/ModularBookmarks";
import ModularRecents from "@/components/ModularRecents";
import FontSettingsPage from "./Settings";
import TabHome from "./Tabhome";
import Search from "./Search";

const Home = memo(() => {
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const [leftPanelView, setLeftPanelView] = useState<
    "sermons" | "search" | "bookmarks" | "recents" | "settings" | "home"
  >("sermons");
  const [slideDirection, setSlideDirection] = useState(1);
  const [background, setBackground] = useState(false);
  const [showPresentationHint, setShowPresentationHint] = useState(false);
  const {
    randomSermons,
    setSelectedMessage,
    setCB,
    selectedMessage,
    loading,
    isPresentationMode,
  } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();

  // Listen for navigation events from TabHome
  useEffect(() => {
    const handleNavigateToSermons = () => {
      setLeftPanelView("sermons");
    };
    window.addEventListener("navigate-to-sermons", handleNavigateToSermons);
    return () => {
      window.removeEventListener(
        "navigate-to-sermons",
        handleNavigateToSermons,
      );
    };
  }, []);
  const [hoveredSermon, setHoveredSermon] = useState<string | number | null>(
    null,
  );

  // Auto-hide presentation hint after 3 seconds
  useEffect(() => {
    if (isPresentationMode) {
      setShowPresentationHint(true);
      const timer = setTimeout(() => {
        setShowPresentationHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPresentationMode]);

  // Memoize scriptures to prevent recreation on every render
  const scriptures = useMemo(
    () => [
      {
        verse:
          "But in the days of the voice of the seventh angel, when he shall begin to sound, the mystery of God should be finished, as he hath declared to his servants the prophets.",
        reference: "Revelation 10:7",
      },
      {
        verse:
          "And I saw another mighty angel come down from heaven, clothed with a cloud: and a rainbow was upon his head, and his face was as it were the sun, and his feet as pillars of fire",
        reference: "Revelation 10:1",
      },
      {
        verse:
          "Wherefore we labour, that, whether present or absent, we may be accepted of him.",
        reference: "II Corinthians 5:9",
      },
      {
        verse:
          "Seeing ye have purified your souls in obeying the truth through the Spirit unto unfeigned love of the brethren, see that ye love one another with a pure heart fervently",
        reference: "I Peter 1:22",
      },
      {
        verse:
          "For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us",
        reference: "Romans 8:18",
      },
      {
        verse:
          "Let us hear the conclusion of the whole matter: Fear God, and keep his commandments: for this is the whole duty of man.",
        reference: "Ecclesiastes 12:13",
      },
    ],
    [],
  );

  // Memoize current scripture to prevent unnecessary recalculations
  const currentScripture = useMemo(
    () => scriptures[currentScriptureIndex],
    [scriptures, currentScriptureIndex],
  );

  // Navigation items for left sidebar
  const navItems = useMemo(
    () => [
      { id: "home", label: "Home", icon: HomeIcon },
      { id: "sermons", label: "Sermons", icon: BookOpen },
      { id: "search", label: "Search", icon: SearchIcon },
      { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
      { id: "recents", label: "Recents", icon: Clock },
      { id: "settings", label: "Settings", icon: Settings },
    ],
    [],
  ) as Array<{
    id: "sermons" | "search" | "bookmarks" | "recents" | "settings" | "home";
    label: string;
    icon: any;
  }>;

  const switchView = useCallback(
    (
      id: "sermons" | "search" | "bookmarks" | "recents" | "settings" | "home",
    ) => {
      const currentIndex = navItems.findIndex((n) => n.id === leftPanelView);
      const nextIndex = navItems.findIndex((n) => n.id === id);
      setSlideDirection(nextIndex >= currentIndex ? 1 : -1);
      setLeftPanelView(id);
    },
    [leftPanelView, navItems],
  );

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  };

  return (
    <div
      className={`${isPresentationMode ? "h-screen" : "h-[96vh]"} w-screen flex overflow-hidden bg-gray-50 dark:bg-surface transition-all duration-300`}
    >
      {/* Presentation Mode Indicator */}
      <AnimatePresence>
        {isPresentationMode && showPresentationHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-800/90 dark:bg-stone-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <span className="text-sm font-medium">Presentation Mode</span>
            <span className="text-xs opacity-75">•</span>
            <span className="text-xs opacity-75">Press ESC to exit</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Book Layout */}
      <motion.div
        className="flex-1 h-full flex px-3 py-3 overflow-hidden"
        animate={{
          paddingLeft: isPresentationMode ? "0px" : "12px",
          paddingRight: isPresentationMode ? "0px" : "12px",
          paddingTop: isPresentationMode ? "0px" : "12px",
          paddingBottom: isPresentationMode ? "0px" : "12px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Left Panel - Left Page of Book */}
        <motion.div
          className="relative w-[50%] h-full border border-solid border-stone-300 dark:border-stone-700 rounded-l-3xl rounded-r-md overflow-hidden shadow-lg"
          animate={{
            width: isPresentationMode ? "0%" : "50%",
            opacity: isPresentationMode ? 0 : 1,
            marginRight: isPresentationMode ? "0px" : "0px",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ display: isPresentationMode ? "none" : "block" }}
        >
          {/* Curved page stack effect on left edge - SVG for natural look */}
          <svg
            className="absolute left-0 top-0 h-full w-6 overflow-visible"
            viewBox="0 0 24 100"
            preserveAspectRatio="none"
          >
            {/* Back pages - stacked effect */}
            <path
              d="M24,2 Q8,2 6,10 Q2,25 2,50 Q2,75 6,90 Q8,98 24,98"
              className="fill-stone-300 dark:fill-stone-600"
            />
            <path
              d="M24,3 Q10,3 8,12 Q4,27 4,50 Q4,73 8,88 Q10,97 24,97"
              className="fill-stone-200 dark:fill-stone-700"
            />
            <path
              d="M24,4 Q12,4 10,14 Q6,29 6,50 Q6,71 10,86 Q12,96 24,96"
              className="fill-stone-100 dark:fill-stone-800"
            />
          </svg>
          {/* Page curl shadow */}
          <div className="absolute left-4 top-8 bottom-8 w-4 bg-gradient-to-r from-stone-400/20 to-transparent dark:from-stone-500/15 dark:to-transparent rounded-l-full"></div>

          <div className="relative w-full bg-gradient-to-r from-stone-50 via-white to-white h-full dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 rounded-l-2xl overflow-hidden flex flex-row border border-r-0 border-stone-300 dark:border-stone-700 shadow-[inset_-8px_0_12px_-8px_rgba(0,0,0,0.08),_-4px_0_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[inset_-8px_0_12px_-8px_rgba(0,0,0,0.3),_-4px_0_8px_-2px_rgba(0,0,0,0.2)]">
            {/* Vertical Icon Sidebar Nav — never re-mounts, stays frozen */}
            <div className="relative z-10 flex-shrink-0 w-14 h-full flex flex-col items-center py-3 gap-1 border-r border-stone-200 dark:border-stone-700/60 bg-stone-50/80 dark:bg-stone-950/60 backdrop-blur-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = leftPanelView === item.id;
                return (
                  <Tooltip key={item.id} title={item.label} placement="right">
                    <motion.button
                      onClick={() => switchView(item.id as any)}
                      whileTap={{ scale: 0.92 }}
                      className={`relative w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer border-0 outline-none group ${
                        isActive
                          ? "shadow-md"
                          : "text-stone-400 dark:text-stone-500 hover:bg-stone-200/70 dark:hover:bg-stone-700/50 hover:text-stone-700 dark:hover:text-stone-200 bg-transparent"
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: accentColor + "20",
                              color: accentColor,
                            }
                          : undefined
                      }
                    >
                      {/* Active left-edge indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebarIndicator"
                          className="absolute -left-[1px] top-2 bottom-2 w-[3px] rounded-r-full"
                          style={{ backgroundColor: accentColor }}
                          transition={{
                            type: "spring",
                            bounce: 0.3,
                            duration: 0.5,
                          }}
                        />
                      )}
                      <Icon
                        className="w-[16px] h-[16px]"
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </motion.button>
                  </Tooltip>
                );
              })}
            </div>

            {/* Sliding content area — sidebar above stays frozen */}
            <div className="relative flex-1 h-full overflow-hidden bg-white dark:bg-stone-950">
              <AnimatePresence mode="popLayout" custom={slideDirection}>
                <motion.div
                  key={leftPanelView}
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: {
                      type: "spring",
                      stiffness: 380,
                      damping: 34,
                      mass: 0.7,
                    },
                    opacity: { duration: 0.18 },
                  }}
                  className="absolute inset-0 overflow-auto no-scrollbar"
                >
                  {leftPanelView === "sermons" && (
                    <div className="h-full">
                      <SermonList />
                    </div>
                  )}

                  {leftPanelView === "search" && (
                    <div className="h-full overflow-auto no-scrollbar">
                      <Search />
                    </div>
                  )}

                  {leftPanelView === "bookmarks" && (
                    <div className="h-full flex flex-col overflow-hidden">
                      <div className="flex-shrink-0 px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200 tracking-wide">
                            Bookmarks
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                        <ModularBookmarks
                          className="h-full"
                          showHeader={false}
                          maxHeight="100%"
                        />
                      </div>
                    </div>
                  )}

                  {leftPanelView === "recents" && (
                    <div className="h-full flex flex-col overflow-hidden">
                      <div className="flex-shrink-0 px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200 tracking-wide">
                            Recent Activity
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                        <ModularRecents
                          className="h-full"
                          showHeader={false}
                          maxHeight="100%"
                        />
                      </div>
                    </div>
                  )}

                  {leftPanelView === "settings" && (
                    <div className="h-full">
                      <FontSettingsPage />
                    </div>
                  )}

                  {leftPanelView === "home" && (
                    <div className="h-full">
                      <TabHome />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Book Spine / Hinge - Center Binding */}
        <motion.div
          className="relative flex-shrink-0 w-5 h-full flex flex-col items-center py-8"
          animate={{
            width: isPresentationMode ? "0px" : "20px",
            opacity: isPresentationMode ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ display: isPresentationMode ? "none" : "flex" }}
        >
          {/* Spine background - not full height */}
          <div className="relative flex-1 w-full roun overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 shadow-inner"></div>

            {/* Spine stitching/texture */}
            <div className="absolute inset-x-0 top-4 bottom-4 flex flex-col justify-evenly items-center">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-0.5 bg-stone-600/40 dark:bg-stone-300/20 rounded-full"
                ></div>
              ))}
            </div>
          </div>

          {/* Top hinge ring */}
          <div className="absolute top-12 w-4 h-6 bg-gradient-to-b from-stone-400 to-stone-500 dark:from-stone-700 dark:to-stone-800 rounded-full shadow-md border border-stone-500/50 dark:border-stone-600/60">
            <div className="absolute inset-1 bg-gradient-to-b from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-700 rounded-full"></div>
          </div>

          {/* Middle hinge ring */}
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-gradient-to-b from-stone-400 to-stone-500 dark:from-stone-700 dark:to-stone-800 rounded-full shadow-md border border-stone-500/50 dark:border-stone-600/60 z-10">
            <div className="absolute inset-1 bg-gradient-to-b from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-700 rounded-full"></div>
          </div>

          {/* Bottom hinge ring */}
          <div className="absolute bottom-12 w-4 h-6 bg-gradient-to-b from-stone-400 to-stone-500 dark:from-stone-700 dark:to-stone-800 rounded-full shadow-md border border-stone-500/50 dark:border-stone-600/60">
            <div className="absolute inset-1 bg-gradient-to-b from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-700 rounded-full"></div>
          </div>
        </motion.div>

        {/* Right Panel - Right Page of Book */}
        <motion.div
          className="relative bg-gradient-to-l from-stone-50 via-white to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 h-full border border-solid border-stone-300 dark:border-stone-700 overflow-hidden shadow-lg flex items-center justify-center"
          animate={{
            width: isPresentationMode ? "100%" : "50%",
            borderRadius: isPresentationMode ? "0px" : "0px 24px 24px 0px",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Curved page stack effect on right edge - SVG for natural look */}
          {!isPresentationMode && (
            <>
              <svg
                className="absolute right-0 top-0 h-full w-6 overflow-visible"
                viewBox="0 0 24 100"
                preserveAspectRatio="none"
              >
                {/* Back pages - stacked effect */}
                <path
                  d="M0,2 Q16,2 18,10 Q22,25 22,50 Q22,75 18,90 Q16,98 0,98"
                  className="fill-stone-300 dark:fill-stone-600"
                />
                <path
                  d="M0,3 Q14,3 16,12 Q20,27 20,50 Q20,73 16,88 Q14,97 0,97"
                  className="fill-stone-200 dark:fill-stone-700"
                />
                <path
                  d="M0,4 Q12,4 14,14 Q18,29 18,50 Q18,71 14,86 Q12,96 0,96"
                  className="fill-stone-100 dark:fill-stone-800"
                />
              </svg>
              {/* Page curl shadow */}
              <div className="absolute right-4 top-8 bottom-8 w-4 bg-gradient-to-l from-stone-50 via-white to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-900  rounded-r-full"></div>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative w-full ${isPresentationMode ? "h-full" : "h-[95%]"} bg-gradient-to-l from-stone-50 via-white to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 ${isPresentationMode ? "rounded-none" : "rounded-r-2xl"} overflow-hidden flex flex-col ${isPresentationMode ? "border-0" : "border border-l-0 border-stone-300 dark:border-stone-700"}`}
          >
            {selectedMessage ? (
              <SelectedSermon
                background={background}
                setBackground={setBackground}
              />
            ) : (
              <div className="w-full h-full p-8 flex flex-col gap-6 overflow-hidden">
                {/* Shimmer skeleton for sermon title */}
                <div className="mt-4">
                  <div
                    className={`h-10 rounded-lg mb-3 animate-pulse ${
                      isDarkMode
                        ? "bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700"
                        : "bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200"
                    }`}
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                  <div
                    className={`h-8 w-3/4 rounded-lg animate-pulse ${
                      isDarkMode
                        ? "bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700"
                        : "bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200"
                    }`}
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </div>

                {/* Shimmer skeleton for sermon paragraphs */}
                <div className="flex-1 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <div
                        className={`h-4 rounded ${
                          isDarkMode
                            ? "bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700"
                            : "bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200"
                        }`}
                        style={{
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s infinite",
                          animationDelay: `${i * 0.1}s`,
                          width: `${90 - i * 5}%`,
                        }}
                      />
                      <div
                        className={`h-4 rounded ${
                          isDarkMode
                            ? "bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700"
                            : "bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200"
                        }`}
                        style={{
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s infinite",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Global shimmer animation */}
                <style>{`
                  @keyframes shimmer {
                    0% {
                      backgroundPosition: 200% 0;
                    }
                    100% {
                      backgroundPosition: -200% 0;
                    }
                  }
                `}</style>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default Home;
