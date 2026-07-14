import React, { useState, useEffect, useCallback } from "react";
import {
  Mic,
  MonitorPlay,
  Sun,
  Moon,
  RefreshCw,
  HelpCircle,
  X,
  Minus,
  Square,
} from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";
import Help from "@/shared/Help";
import UpdateManager from "@/shared/UpdateManager";
import FontPicker from "@/components/FontPicker";
import { useSermonContext } from "../Provider/Vsermons";
import { Tooltip } from "antd";
import { Sermon } from "@/types/index.js";

const TitleBar: React.FC = () => {
  const {
    handleClose,
    handleMaximize,
    handleMinimize,
    isPresentationMode,
    setIsPresentationMode,
    activeTab,
    setActiveTab,
    selectedMessage,
    recentSermons,
    allSermons,
    setSelectedMessage,
  } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();

  // Sermon tabs state
  const [openTabs, setOpenTabs] = useState<Sermon[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [hoveredControl, setHoveredControl] = useState<"close" | "min" | "max" | null>(null);

  // Load persisted tabs on component mount
  useEffect(() => {
    const savedTabs = localStorage.getItem("openSermonTabs");
    const savedActiveTabId = localStorage.getItem("activeSermonTabId");
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setOpenTabs(parsedTabs);
        if (savedActiveTabId) setActiveTabId(savedActiveTabId);
      } catch {
        localStorage.removeItem("openSermonTabs");
        localStorage.removeItem("activeSermonTabId");
      }
    }
  }, []);

  // Persist tabs
  useEffect(() => {
    if (openTabs.length > 0) {
      localStorage.setItem("openSermonTabs", JSON.stringify(openTabs));
    } else {
      localStorage.removeItem("openSermonTabs");
    }
  }, [openTabs]);

  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem("activeSermonTabId", activeTabId);
    } else {
      localStorage.removeItem("activeSermonTabId");
    }
  }, [activeTabId]);

  const findSermonById = useCallback(
    (sermonId: string | number) => {
      return (
        recentSermons.find((s) => s.id.toString() === sermonId.toString()) ||
        allSermons?.find((s) => s.id.toString() === sermonId.toString())
      );
    },
    [recentSermons, allSermons],
  );

  const addSermonTab = (sermon: Sermon) => {
    setOpenTabs((prevTabs) => {
      const existingIndex = prevTabs.findIndex((tab) => tab.id === sermon.id);
      if (existingIndex !== -1) {
        const newTabs = [...prevTabs];
        const existing = newTabs.splice(existingIndex, 1)[0];
        newTabs.push(existing);
        setActiveTabId(sermon.id.toString());
        return newTabs;
      }
      const newTabs = [...prevTabs, sermon];
      if (newTabs.length > 7) newTabs.shift();
      setActiveTabId(sermon.id.toString());
      return newTabs;
    });
  };

  // Add sermon to tabs when selectedMessage changes
  useEffect(() => {
    if (selectedMessage && activeTab === "message") {
      addSermonTab(selectedMessage);
    }
  }, [selectedMessage, activeTab]);

  // Cleanup stale tabs when sermon data changes
  useEffect(() => {
    if (openTabs.length > 0) {
      setOpenTabs((prevTabs) => {
        const valid = prevTabs.filter((tab) => !!findSermonById(tab.id));
        if (activeTabId && !valid.find((t) => t.id.toString() === activeTabId)) {
          setActiveTabId(null);
          setSelectedMessage(null);
        }
        return valid;
      });
    }
  }, [allSermons, recentSermons]);

  // Restore active tab on mount
  useEffect(() => {
    if (activeTabId && !selectedMessage && openTabs.length > 0) {
      const tab = openTabs.find((t) => t.id.toString() === activeTabId);
      if (tab) {
        const full = findSermonById(tab.id);
        setSelectedMessage(full || tab);
        setActiveTab("message");
      }
    }
  }, [activeTabId, openTabs, allSermons, recentSermons]);

  return (
    <div className="z-50 w-screen" style={{ WebkitAppRegion: "drag" } as any}>
      <div className="h-[4.5vh] min-h-[38px] flex items-center justify-between pl-3 pr-0 border-b border-zinc-200/80 dark:border-zinc-700/60 select-none relative bg-zinc-50 dark:bg-zinc-950 backdrop-blur-sm">

        {/* ── Left: Sermon tabs ──────────────────────────────── */}
        <div
          className="flex items-center gap-0.5 flex-shrink-0 min-w-0 h-full"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Active/current sermon tab */}
          {selectedMessage && activeTab === "message" && (
            <div
              key={`current-${selectedMessage.id}`}
              className="relative flex items-center gap-1.5 px-3 py-0.5 cursor-default flex-shrink-0 max-w-[180px] min-w-[90px] h-[75%] rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
                border: `1px solid ${accentColor}35`,
                boxShadow: `0 1px 8px ${accentColor}15`,
              }}
              title={selectedMessage.title}
            >
              {/* Accent top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: accentColor }}
              />

              {/* Active pulse dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: accentColor }}
              />

              <span
                className="text-[10px] font-semibold truncate flex-1"
                style={{ color: isDarkMode ? "#e7e5e4" : "#1c1917" }}
              >
                {selectedMessage.title.length > 22
                  ? selectedMessage.title.substring(0, 22) + "…"
                  : selectedMessage.title}
              </span>

              {selectedMessage.audioUrl && (
                <Mic
                  className="w-2.5 h-2.5 flex-shrink-0 opacity-60"
                  style={{ color: accentColor }}
                />
              )}
            </div>
          )}

          {/* Separator */}
          {selectedMessage && activeTab === "message" && recentSermons.length > 0 && (
            <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-1.5 flex-shrink-0" />
          )}

          {/* Recent sermon tabs (max 4, excluding current) */}
          {recentSermons
            .slice(0, 4)
            .filter((s) => s.id !== selectedMessage?.id)
            .map((sermon) => (
              <div
                key={sermon.id}
                onClick={() => {
                  setSelectedMessage(sermon);
                  setActiveTab("message");
                  if (!openTabs.find((t) => t.id === sermon.id)) {
                    setOpenTabs((prev) => [...prev, sermon]);
                  }
                  setActiveTabId(sermon.id.toString());
                }}
                className="relative flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg cursor-pointer flex-shrink-0 max-w-[150px] min-w-[80px] h-[75%] transition-all duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 group"
                title={sermon.title}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-zinc-300 dark:bg-zinc-600 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-500 transition-colors" />
                <span className="text-[10px] font-medium truncate flex-1 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                  {sermon.title.length > 20
                    ? sermon.title.substring(0, 20) + "…"
                    : sermon.title}
                </span>
                {sermon.audioUrl && (
                  <Mic className="w-2 h-2 flex-shrink-0 text-zinc-400 dark:text-zinc-600" />
                )}
              </div>
            ))}
        </div>

        {/* ── Centre: App brand ─────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center pointer-events-none px-4 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Decorative glyph using accent color */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={accentColor} strokeWidth="1.2" opacity="0.7" />
              <circle cx="6" cy="6" r="2.5" fill={accentColor} opacity="0.55" />
            </svg>
            <span
              className="text-[11px] font-semibold tracking-widest uppercase"
              style={{ color: isDarkMode ? "#a8a29e" : "#78716c", letterSpacing: "0.18em" }}
            >
              His Voice
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={accentColor} strokeWidth="1.2" opacity="0.7" />
              <circle cx="6" cy="6" r="2.5" fill={accentColor} opacity="0.55" />
            </svg>
          </div>
        </div>

        {/* ── Right: Controls ───────────────────────────────── */}
        <div
          className="flex items-stretch h-full flex-shrink-0"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Utilities section (centered vertically inside h-full parent) */}
          <div className="flex items-center gap-1.5 pr-3">
            {/* Font picker */}
            <FontPicker />

            {/* Divider */}
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            {/* Presentation mode toggle */}
            <Tooltip title={isPresentationMode ? "Exit Presentation" : "Presentation Mode"}>
              <button
                onClick={() => setIsPresentationMode(!isPresentationMode)}
                className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800 group"
                aria-label="Toggle presentation mode"
              >
                <MonitorPlay
                  className="w-[18px] h-[18px] transition-colors"
                  style={{
                    color: isPresentationMode
                      ? accentColor
                      : isDarkMode
                        ? "#78716c"
                        : "#a8a29e",
                  }}
                />
              </button>
            </Tooltip>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Help */}
            <Help />

            {/* Update manager */}
            <UpdateManager />
          </div>

          {/* Windows-style Window controls */}
          <div className="flex items-stretch h-full border-l border-zinc-200/80 dark:border-zinc-800/80">
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 hover:bg-zinc-200 dark:hover:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-none border-0 bg-transparent"
              title="Minimize"
              aria-label="Minimize"
            >
              <Minus className="w-[16px] h-[16px]" />
            </button>

            {/* Maximize */}
            <button
              onClick={handleMaximize}
              className="w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 hover:bg-zinc-200 dark:hover:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-none border-0 bg-transparent"
              title="Maximize"
              aria-label="Maximize"
            >
              <Square className="w-[12px] h-[12px] stroke-[1.5]" />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 hover:bg-[#e81123] text-zinc-500 dark:text-zinc-400 hover:text-white rounded-none border-0 bg-transparent group"
              title="Close"
              aria-label="Close"
            >
              <X className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
