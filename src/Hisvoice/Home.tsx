import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/Provider/Theme";
import { Tooltip } from "antd";
import {
  LibraryBig,
  SlidersHorizontal,
  BookMarked,
  PanelsTopLeft,
  ScanSearch,
  History,
  BookOpenText,
} from "lucide-react";

// Lazy load heavy components — only compiled by Vite when the tab is first opened
const SermonList = lazy(() => import("./Allsermons"));
const SelectedSermon = lazy(() => import("./SelectedSermon"));
const ModularBookmarks = lazy(() => import("@/components/ModularBookmarks"));
const ModularRecents = lazy(() => import("@/components/ModularRecents"));
const FontSettingsPage = lazy(() => import("./Settings"));
const TabHome = lazy(() => import("./Tabhome"));
const Search = lazy(() => import("./Search"));

const Home = memo(() => {
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const [leftPanelView, setLeftPanelView] = useState<
    | "current"
    | "sermons"
    | "search"
    | "bookmarks"
    | "recents"
    | "settings"
    | "home"
  >("sermons");
  const [slideDirection, setSlideDirection] = useState(1);
  const [background, setBackground] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const { randomSermons, setSelectedMessage, setCB, selectedMessage, loading } =
    useSermonContext();
  const { isDarkMode, accentColor } = useTheme();

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

  const currentScripture = useMemo(
    () => scriptures[currentScriptureIndex],
    [scriptures, currentScriptureIndex],
  );

  const navItems = useMemo(
    () => [
      { id: "current", label: "Current Sermon", icon: BookOpenText },
      { id: "home", label: "Home", icon: PanelsTopLeft },
      { id: "sermons", label: "Sermons", icon: LibraryBig },
      { id: "search", label: "Search", icon: ScanSearch },
      { id: "bookmarks", label: "Bookmarks", icon: BookMarked },
      { id: "recents", label: "Recents", icon: History },
      { id: "settings", label: "Settings", icon: SlidersHorizontal },
    ],
    [],
  ) as Array<{
    id:
      | "current"
      | "sermons"
      | "search"
      | "bookmarks"
      | "recents"
      | "settings"
      | "home";
    label: string;
    icon: any;
  }>;

  const switchView = useCallback(
    (
      id:
        | "current"
        | "sermons"
        | "search"
        | "bookmarks"
        | "recents"
        | "settings"
        | "home",
    ) => {
      if (id === "current") {
        setIsSidePanelOpen(false);
        return;
      }

      const currentIndex = navItems.findIndex((n) => n.id === leftPanelView);
      const nextIndex = navItems.findIndex((n) => n.id === id);
      setSlideDirection(nextIndex >= currentIndex ? 1 : -1);
      setLeftPanelView(id);
      setIsSidePanelOpen(true);
    },
    [leftPanelView, navItems],
  );

  const closeSidePanel = useCallback(() => {
    setIsSidePanelOpen(false);
  }, []);

  const slideVariants = {
    enter: () => ({ x: -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: () => ({ x: -60, opacity: 0 }),
  };

  const showFullWidthSermon = Boolean(selectedMessage);

  return (
    <div className="h-[96vh] relative w-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="h-full w-14 flex-shrink-0 bg-zinc-50/80 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-700/60 flex flex-col items-center py-3 gap-1 overflow-hidden z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = leftPanelView === item.id;

          return (
            <Tooltip key={item.id} title={item.label} placement="right">
              <motion.button
                onClick={() => switchView(item.id as any)}
                whileTap={{ scale: 0.92 }}
                className={`relative w-10 h-10 flex flex-col items-center justify-center rounded-2xl transition-colors duration-150 cursor-pointer border-0 outline-none group overflow-hidden ${
                  isActive
                    ? "shadow-[0_10px_20px_-12px_rgba(0,0,0,0.45)]"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
                style={
                  isActive
                    ? {
                        color: accentColor,
                        boxShadow: `0 10px 20px -14px ${accentColor}90`,
                      }
                    : undefined
                }
              >
                <span
                  className={`absolute inset-0 rounded-2xl transition-colors duration-150 ${
                    isActive
                      ? "border"
                      : "bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/90 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 group-hover:from-zinc-200 group-hover:via-zinc-100 group-hover:to-zinc-200 dark:group-hover:from-zinc-700 dark:group-hover:via-zinc-800 dark:group-hover:to-zinc-700"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(145deg, ${accentColor}30, ${accentColor}12)`,
                          borderColor: `${accentColor}45`,
                        }
                      : undefined
                  }
                />
                <span className="absolute left-1.5 right-1.5 top-1 h-2.5 rounded-full bg-white/70 dark:bg-white/10 opacity-90" />
                <span className="absolute inset-[1px] rounded-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.32)]" />

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
                  className="relative z-10 w-[17px] h-[17px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.45)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </motion.button>
            </Tooltip>
          );
        })}
      </div>

      <div
        className={`relative flex-1 h-full overflow-hidden ${showFullWidthSermon ? "px-0 py-0" : "px-3 py-3"}`}
      >
        <div className="relative h-full w-full overflow-hidden shadow-lg">
          <div className="relative w-full h-full bg-gradient-to-l from-zinc-50 via-white to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 overflow-hidden flex flex-col border border-zinc-300 dark:border-zinc-700 rounded-l-3xl">
           
            <div className="absolute right-4 top-8 bottom-8 w-4 bg-gradient-to-l from-zinc-50 via-white to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 rounded-r-full" />

            {selectedMessage ? (
              <Suspense fallback={null}>
                <SelectedSermon
                  background={background}
                  setBackground={setBackground}
                />
              </Suspense>
            ) : (
              <div className="bg-white dark:bg-background h-full relative w-full">
                <div className="h-full flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    <div className="w-full px-2 py-2">
                      <div className="w-full">
                        <div className="pt-3 text-center mb-3">
                          <div
                            className={`h-9 rounded-lg mx-auto animate-pulse ${
                              isDarkMode
                                ? "bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800"
                                : "bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200"
                            }`}
                            style={{
                              backgroundSize: "200% 100%",
                              animation: "shimmer 2s infinite",
                              width: "60%",
                              maxWidth: "500px",
                            }}
                          />
                        </div>

                        <div className="space-y- mt-3">
                          <div className="px-6 py-4 space-y-5 animate-pulse">
                            {Array.from({ length: 14 }).map((_, i) => (
                              <div key={i} className="flex gap-3">
                                <div
                                  className="flex-shrink-0 w-8 h-4 rounded"
                                  style={{
                                    backgroundColor: isDarkMode
                                      ? "rgba(120,113,108,.25)"
                                      : "rgba(214,211,209,.6)",
                                  }}
                                />
                                <div className="flex-1 space-y-2">
                                  <div
                                    className="h-4 rounded"
                                    style={{
                                      width: `${70 + (i % 4) * 7}%`,
                                      backgroundColor: isDarkMode
                                        ? "rgba(120,113,108,.18)"
                                        : "rgba(214,211,209,.5)",
                                    }}
                                  />
                                  {i % 3 !== 2 && (
                                    <div
                                      className="h-4 rounded"
                                      style={{
                                        width: `${45 + (i % 5) * 9}%`,
                                        backgroundColor: isDarkMode
                                          ? "rgba(120,113,108,.12)"
                                          : "rgba(214,211,209,.35)",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

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
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isSidePanelOpen && (
            <motion.div
              key="side-panel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[1px]"
              onMouseDown={closeSidePanel}
            >
              <motion.div
                key={leftPanelView}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 500, damping: 38, mass: 0.5 },
                  opacity: { duration: 0.12 },
                }}
                className={`absolute left-0 top-0 bottom-0 z-30 overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur ${
                  leftPanelView === "home"
                    ? "right-0 w-full rounded-none"
                    : "w-[70%] rounded-r-3xl"
                }`}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <Suspense fallback={null}>
                  <div className="h-full overflow-auto no-scrollbar bg-white/95 dark:bg-zinc-950/95">
                    {leftPanelView === "sermons" && (
                      <div className="h-full">
                        <SermonList onSermonSelect={closeSidePanel} />
                      </div>
                    )}

                    {leftPanelView === "search" && (
                      <div className="h-full overflow-auto no-scrollbar">
                        <Search onSelect={closeSidePanel} />
                      </div>
                    )}

                    {leftPanelView === "bookmarks" && (
                      <div className="h-full flex flex-col overflow-hidden">
                        <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <BookMarked className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tracking-wide">
                              Bookmarks
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                          <ModularBookmarks
                            className="h-full"
                            showHeader={false}
                            maxHeight="100%"
                            onSelect={closeSidePanel}
                          />
                        </div>
                      </div>
                    )}

                    {leftPanelView === "recents" && (
                      <div className="h-full flex flex-col overflow-hidden">
                        <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tracking-wide">
                              Recent Activity
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                          <ModularRecents
                            className="h-full"
                            showHeader={false}
                            maxHeight="100%"
                            onSelect={closeSidePanel}
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
                  </div>
                </Suspense>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
    </div>
  );
});

export default Home;
