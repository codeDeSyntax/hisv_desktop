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

  // Helper to determine if the accentColor is dark for proper text contrast
  const isAccentDark = (() => {
    if (!accentColor) return true;
    const color = accentColor.replace("#", "");
    if (color.length !== 6) return true;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 160; // Dark background if YIQ < 160
  })();

  const brandColor = isAccentDark ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.7)";
  const decorationColor = isAccentDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.4)";

  return (
    <div className="z-50 w-screen" style={{ WebkitAppRegion: "drag" } as any}>
      <div
        className="h-[4.5vh] min-h-[38px] flex items-center justify-between pl-3 pr-0 border-b select-none relative backdrop-blur-sm"
        style={{
          backgroundColor: accentColor,
          borderColor: isAccentDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)",
          // Expose CSS variables for child components to inherit automatically
          ["--tb-hover-bg" as any]: isAccentDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
          ["--tb-fg" as any]: isAccentDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.65)",
          ["--tb-fg-hover" as any]: isAccentDark ? "#ffffff" : "#000000",
          ["--tb-border" as any]: isAccentDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* ── Left: Sermon tabs ──────────────────────────────── */}
        <div
          className="flex items-center gap-0.5 flex-shrink-0 min-w-0 h-full"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Active/current sermon tab */}
          {selectedMessage && activeTab === "message" && (
            <div
              key={`current-${selectedMessage.id}`}
              className="relative flex items-center gap-1.5 px-3 py-0.5 cursor-default flex-shrink-0 max-w-[180px] min-w-[90px] h-[75%] rounded-lg overflow-hidden border border-solid"
              style={{
                background: isAccentDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.1)",
                borderColor: isAccentDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
              }}
              title={selectedMessage.title}
            >
              {/* Active pulse dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: isAccentDark ? "#ffffff" : "#000000" }}
              />

              <span
                className="text-[10px] font-semibold truncate flex-1"
                style={{ color: isAccentDark ? "#ffffff" : "#000000" }}
              >
                {selectedMessage.title.length > 22
                  ? selectedMessage.title.substring(0, 22) + "…"
                  : selectedMessage.title}
              </span>

              {selectedMessage.audioUrl && (
                <Mic
                  className="w-2.5 h-2.5 flex-shrink-0 opacity-75"
                  style={{ color: isAccentDark ? "#ffffff" : "#000000" }}
                />
              )}
            </div>
          )}

          {/* Separator */}
          {selectedMessage && activeTab === "message" && recentSermons.length > 0 && (
            <div
              className="w-px h-3 mx-1.5 flex-shrink-0"
              style={{ backgroundColor: isAccentDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)" }}
            />
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
                className={`relative flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg cursor-pointer flex-shrink-0 max-w-[150px] min-w-[80px] h-[75%] transition-all duration-150 group ${
                  isAccentDark
                    ? "hover:bg-white/8 text-white/70 hover:text-white"
                    : "hover:bg-black/6 text-black/70 hover:text-black"
                }`}
                title={sermon.title}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                    isAccentDark
                      ? "bg-white/30 group-hover:bg-white/60"
                      : "bg-black/25 group-hover:bg-black/50"
                  }`}
                />
                <span className="text-[10px] font-normal truncate flex-1 leading-none">
                  {sermon.title.length > 20
                    ? sermon.title.substring(0, 20) + "…"
                    : sermon.title}
                </span>
                {sermon.audioUrl && (
                  <Mic
                    className={`w-2 h-2 flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity ${
                      isAccentDark ? "text-white" : "text-black"
                    }`}
                  />
                )}
              </div>
            ))}
        </div>

        {/* ── Centre: App brand ─────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center pointer-events-none px-4 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Decorative glyph */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={decorationColor} strokeWidth="1.2" opacity="0.8" />
              <circle cx="6" cy="6" r="2.5" fill={decorationColor} opacity="0.65" />
            </svg>
            <span
              className="text-[11px] font-dscript font-semibold tracking-widest uppercase"
              style={{
                color: brandColor,
                letterSpacing: "0.18em",
                transform: "scaleY(1.12) scaleX(0.92)",
              }}
            >
              His Voice
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={decorationColor} strokeWidth="1.2" opacity="0.8" />
              <circle cx="6" cy="6" r="2.5" fill={decorationColor} opacity="0.65" />
            </svg>
          </div>
        </div>

        {/* ── Right: Controls ───────────────────────────────── */}
        <div
          className="flex items-stretch h-full flex-shrink-0"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Utilities section */}
          <div className="flex items-center gap-1.5 pr-3">
            {/* Font picker */}
            <FontPicker />

            {/* Divider */}
            <div
              className="w-px h-4 mx-0.5"
              style={{ backgroundColor: isAccentDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)" }}
            />

            {/* Presentation mode toggle */}
            <Tooltip title={isPresentationMode ? "Exit Presentation" : "Presentation Mode"}>
              <button
                onClick={() => setIsPresentationMode(!isPresentationMode)}
                className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  isAccentDark ? "hover:bg-white/10" : "hover:bg-black/8"
                }`}
                aria-label="Toggle presentation mode"
              >
                <MonitorPlay
                  className="w-[18px] h-[18px] transition-colors"
                  style={{
                    color: isPresentationMode
                      ? (isAccentDark ? "#ffffff" : "#000000")
                      : (isAccentDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)"),
                  }}
                />
              </button>
            </Tooltip>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Update manager */}
            <UpdateManager />
          </div>

          {/* Windows-style Window controls */}
          <div
            className="flex items-stretch h-full border-l"
            style={{ borderColor: isAccentDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)" }}
          >
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className={`w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 border-0 bg-transparent rounded-none ${
                isAccentDark
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-black/75 hover:bg-black/8 hover:text-black"
              }`}
              title="Minimize"
              aria-label="Minimize"
            >
              <Minus className="w-[16px] h-[16px]" />
            </button>

            {/* Maximize */}
            <button
              onClick={handleMaximize}
              className={`w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 border-0 bg-transparent rounded-none ${
                isAccentDark
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-black/75 hover:bg-black/8 hover:text-black"
              }`}
              title="Maximize"
              aria-label="Maximize"
            >
              <Square className="w-[12px] h-[12px] stroke-[1.5]" />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className={`w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 border-0 bg-transparent rounded-none ${
                isAccentDark
                  ? "text-white/70 hover:bg-[#e81123] hover:text-white"
                  : "text-black/75 hover:bg-[#e81123] hover:text-white"
              }`}
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
