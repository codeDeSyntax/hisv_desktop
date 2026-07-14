import React, {
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
  BookOpen,
  Library,
  Search as SearchIcon,
  Bookmark,
  Clock,
  Settings2,
  LayoutDashboard,
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
  const [leftPanelView, setLeftPanelView] = useState<
    | "current"
    | "sermons"
    | "search"
    | "bookmarks"
    | "recents"
    | "settings"
    | "home"
  >("sermons");
  const [background, setBackground] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { setSelectedMessage, selectedMessage, loading } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();

  useEffect(() => {
    const handleNavigateToSermons = () => {
      setLeftPanelView("sermons");
      setIsPanelOpen(true);
    };
    window.addEventListener("navigate-to-sermons", handleNavigateToSermons);
    return () => {
      window.removeEventListener("navigate-to-sermons", handleNavigateToSermons);
    };
  }, []);

  const navItems = useMemo(
    () => [
      { id: "current", label: "Reading", icon: BookOpen },
      { id: "home", label: "Home", icon: LayoutDashboard },
      { id: "sermons", label: "Sermons", icon: Library },
      { id: "search", label: "Search", icon: SearchIcon },
      { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
      { id: "recents", label: "History", icon: Clock },
      { id: "settings", label: "Settings", icon: Settings2 },
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
        setIsPanelOpen(false);
        return;
      }
      // Toggle panel off if clicking same active item
      if (id === leftPanelView && isPanelOpen) {
        setIsPanelOpen(false);
        return;
      }
      setLeftPanelView(id);
      setIsPanelOpen(true);
    },
    [leftPanelView, isPanelOpen],
  );

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const showFullWidthSermon = Boolean(selectedMessage);

  return (
    <div className="h-[95.5vh] relative w-screen flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      {/* ── Row 2: Horizontal NavBar ──────────────────────────── */}
      <div
        className="w-full flex-shrink-0 h-10 flex items-center px-3 gap-0.5 border-t border-solid border-x-0 border-b-0 border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 z-30"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = leftPanelView === item.id && isPanelOpen;

          return (
            <motion.button
              key={item.id}
              onClick={() => switchView(item.id as any)}
              whileTap={{ scale: 0.93 }}
              className="relative flex items-center gap-1.5 px-3 h-7 rounded-lg cursor-pointer border-0 outline-none transition-all duration-150 flex-shrink-0"
              style={{
                background: isActive
                  ? `color-mix(in srgb, ${accentColor} 13%, transparent)`
                  : undefined,
              }}
            >
              {/* Bottom accent indicator */}
              {isActive && (
                <motion.div
                  layoutId="navBarPill"
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                  style={{ backgroundColor: accentColor }}
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
                />
              )}

              <Icon
                style={{
                  width: 13,
                  height: 13,
                  color: isActive
                    ? accentColor
                    : isDarkMode
                      ? "#78716c"
                      : "#a8a29e",
                  strokeWidth: isActive ? 2.3 : 1.7,
                  flexShrink: 0,
                  transition: "color 0.15s, stroke-width 0.15s",
                }}
              />
              <span
                className="text-[11px] font-medium transition-colors duration-150 whitespace-nowrap"
                style={{
                  color: isActive
                    ? accentColor
                    : isDarkMode
                      ? "#78716c"
                      : "#a8a29e",
                }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Content area (full width) ─────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        <div className="relative h-full w-full overflow-hidden">
          <div
            className={`relative w-full h-full overflow-hidden flex flex-col ${
              showFullWidthSermon
                ? ""
                : "bg-gradient-to-b from-zinc-50 via-white to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900"
            }`}
          >
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
                      0% { backgroundPosition: 200% 0; }
                      100% { backgroundPosition: -200% 0; }
                    }
                  `}</style>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Slide-in panel (drops down from nav bar) ─────────── */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              key="panel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-20  bg-black/10 backdrop-blur-[1px]"
              onMouseDown={closePanel}
            >
              <motion.div
                key={leftPanelView}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{
                  y: { type: "spring", stiffness: 500, damping: 38, mass: 0.5 },
                  opacity: { duration: 0.12 },
                }}
                className={`absolute top-0 left-0 px-5 w-1/2 z-30 overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-2xl ${
                  leftPanelView === "home"
                    ? "bottom-0 rounded-br-3xl"
                    : "h-[100%] "
                }`}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Suspense fallback={null}>
                  <div className="h-full overflow-auto no-scrollbar bg-white dark:bg-zinc-950">

                    {leftPanelView === "sermons" && (
                      <div className="h-full">
                        <SermonList onSermonSelect={closePanel} />
                      </div>
                    )}

                    {leftPanelView === "search" && (
                      <div className="h-full overflow-auto no-scrollbar">
                        <Search onSelect={closePanel} />
                      </div>
                    )}

                    {leftPanelView === "bookmarks" && (
                      <div className="h-full flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/70">
                          <div className="flex items-center gap-2">
                            <Bookmark
                              className="w-3.5 h-3.5"
                              style={{ color: accentColor }}
                            />
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                              Bookmarks
                            </span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
                          <ModularBookmarks
                            className="h-full"
                            showHeader={false}
                            maxHeight="100%"
                            onSelect={closePanel}
                          />
                        </div>
                      </div>
                    )}

                    {leftPanelView === "recents" && (
                      <div className="h-full flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/70">
                          <div className="flex items-center gap-2">
                            <Clock
                              className="w-3.5 h-3.5"
                              style={{ color: accentColor }}
                            />
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                              Recent Activity
                            </span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
                          <ModularRecents
                            className="h-full"
                            showHeader={false}
                            maxHeight="100%"
                            onSelect={closePanel}
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
      </div>
    </div>
  );
});

export default Home;
