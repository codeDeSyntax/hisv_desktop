import React, { useState, useEffect, useCallback, useRef } from "react";
import { Mic, X, Minus, Square, ScreenShare } from "lucide-react";
import { ThemeToggle } from "@/shared/ThemeToggler";
import { useTheme } from "@/Provider/Theme";

import UpdateManager from "@/shared/UpdateManager";
import FontPicker from "@/components/FontPicker";
import { useSermonContext } from "../Provider/Vsermons";
import { Tooltip } from "antd";
import { Sermon } from "@/types/index.js";
import { DashOutlined } from "@ant-design/icons";

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

  // Shimmer animation state
  const [shimmerVisible, setShimmerVisible] = useState(false);
  const shimmerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shimmerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Shimmer interval effect
  useEffect(() => {
    const triggerShimmer = () => {
      setShimmerVisible(true);
      shimmerTimeoutRef.current = setTimeout(() => {
        setShimmerVisible(false);
      }, 900);
    };

    // First shimmer after a brief delay on mount
    shimmerTimeoutRef.current = setTimeout(triggerShimmer, 1500);

    // Then repeat every 7 seconds
    shimmerIntervalRef.current = setInterval(triggerShimmer, 7000);

    return () => {
      if (shimmerTimeoutRef.current) clearTimeout(shimmerTimeoutRef.current);
      if (shimmerIntervalRef.current) clearInterval(shimmerIntervalRef.current);
    };
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
        if (
          activeTabId &&
          !valid.find((t) => t.id.toString() === activeTabId)
        ) {
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

  // Contrast-aware color tokens — strong enough to read, not too dim
  const iconColor = isAccentDark
    ? "rgba(255,255,255,0.92)"
    : "rgba(0,0,0,0.88)";
  const iconDimColor = isAccentDark
    ? "rgba(255,255,255,0.65)"
    : "rgba(0,0,0,0.60)";
  const brandColor = isAccentDark
    ? "rgba(255,255,255,0.95)"
    : "rgba(0,0,0,0.90)";
  const decorationColor = isAccentDark
    ? "rgba(255,255,255,0.50)"
    : "rgba(0,0,0,0.40)";

  return (
    <div className="z-50 w-screen" style={{ WebkitAppRegion: "drag" } as any}>
      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes tb-shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(400%) skewX(-15deg); opacity: 0; }
        }
        .tb-shimmer-run {
          animation: tb-shimmer 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      <div
        className="h-[4vh] min-h-[35px] flex items-center justify-between pl-3 pr-0 border-none select-none relative overflow-hidden backdrop-blur-sm"
        style={{
          backgroundColor: accentColor + "88",
        }}
      >
        {/* ── Shimmer sweep ──────────────────────────────────────── */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-1/4 ${shimmerVisible ? "tb-shimmer-run" : "opacity-0"}`}
          style={{
            background: isAccentDark
              ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 60%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.25) 60%, transparent 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Left: Sermon tabs ──────────────────────────────── */}
        <div
          className="flex items-center gap-0.5 flex-shrink-0 min-w-0 h-full relative z-10"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Active/current sermon tab */}
          {selectedMessage && activeTab === "message" && (
            <div
              key={`current-${selectedMessage.id}`}
              className="relative flex items-center gap-1.5 px-3 py-0.5 cursor-default flex-shrink-0 max-w-[180px] min-w-[90px] h-[75%] rounded-lg overflow-hidden border-none "
              style={{
                background: isAccentDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(0,0,0,0.11)",
                borderColor: isAccentDark
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(0,0,0,0.07)",
              }}
              title={selectedMessage.title}
            >
              {/* Active pulse dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: iconColor }}
              />

              <span
                className="text-[10px] font-semibold truncate flex-1 text-white"
                // style={{ color: iconColor }}
              >
                {selectedMessage.title.length > 22
                  ? selectedMessage.title.substring(0, 22) + "…"
                  : selectedMessage.title}
              </span>

              {selectedMessage.audioUrl && (
                <Mic
                  className="w-2.5 h-2.5 flex-shrink-0 opacity-75"
                  style={{ color: iconColor }}
                />
              )}
            </div>
          )}

          {/* Separator */}
          {selectedMessage &&
            activeTab === "message" &&
            recentSermons.length > 0 && (
              <div
                className="w-px h-3 mx-1.5 flex-shrink-0"
                style={{
                  backgroundColor: isAccentDark
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(0,0,0,0.12)",
                }}
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
                className="relative flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg cursor-pointer flex-shrink-0 max-w-[150px] min-w-[80px] h-[75%] transition-all duration-150 group"
                style={{ WebkitAppRegion: "no-drag" } as any}
                title={sermon.title}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                  style={{ backgroundColor: iconDimColor }}
                />
                <span
                  className="text-[10px] font-normal truncate flex-1 leading-none transition-colors duration-150 text-white dark:text-neutral-50"
                  // style={{ color: iconDimColor }}
                >
                  {sermon.title.length > 20
                    ? sermon.title.substring(0, 20) + "…"
                    : sermon.title}
                </span>
                {sermon.audioUrl && (
                  <Mic
                    className="w-2 h-2 flex-shrink-0 transition-opacity"
                    style={{ color: iconDimColor, opacity: 0.75 }}
                  />
                )}
              </div>
            ))}
        </div>

        {/* ── Centre: App brand ─────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center pointer-events-none px-4 min-w-0 relative z-10">
          <div className="flex items-center gap-1.5">
            <DashOutlined style={{ color: decorationColor, fontSize: 11 }} />
            <span
              className="text-[11px] font-semibold -tracking-tight uppercase"
              style={{
                color: "white",
                transform: "scaleY(1.12) scaleX(0.92)",
              }}
            >
              His Voice
            </span>
            <DashOutlined style={{ color: decorationColor, fontSize: 11 }} />
          </div>
        </div>

        {/* ── Right: Controls ───────────────────────────────── */}
        <div
          className="flex items-stretch h-full flex-shrink-0 relative z-10"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          {/* Utilities section */}
          <div className="flex items-center gap-1 pr-3 bg-white dark:bg-neutral-900 px-3">
            {/* Font picker */}
            <FontPicker />

            {/* Divider */}
            <div
              className="w-px h-4 mx-0.5"
              style={{
                backgroundColor: isAccentDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(0,0,0,0.14)",
              }}
            />

            {/* Presentation mode toggle */}
            <Tooltip
              title={
                isPresentationMode ? "Exit Presentation" : "Presentation Mode"
              }
            >
              <button
                onClick={() => setIsPresentationMode(!isPresentationMode)}
                className="p-1 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150"
                style={
                  {
                    "--hover-bg": isAccentDark
                      ? "rgba(255,255,255,0.13)"
                      : "rgba(0,0,0,0.09)",
                  } as any
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = isAccentDark
                    ? "rgba(255,255,255,0.13)"
                    : "rgba(0,0,0,0.09)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                aria-label="Toggle presentation mode"
              >
                <ScreenShare className="w-5 h-5 transition-colors text-black dark:text-white" />
              </button>
            </Tooltip>

            {/* Theme toggle — pass isAccentDark so it can pick the right icon color */}
            <ThemeToggle isAccentDark={isAccentDark} iconColor={iconColor} />

            {/* Update manager */}
            <UpdateManager isAccentDark={isAccentDark} iconColor={iconColor} />
          </div>

          {/* Windows-style Window controls */}
          <div
            className="flex items-stretch h-full border-l"
            style={{
              borderColor: isAccentDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.10)",
            }}
          >
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 text-white border-0 bg-transparent rounded-none"
              // style={{ color: iconDimColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isAccentDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.09)";
                e.currentTarget.style.color = iconColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = iconDimColor;
              }}
              title="Minimize"
              aria-label="Minimize"
            >
              <Minus className="w-[16px] h-[16px]" />
            </button>

            {/* Maximize */}
            <button
              onClick={handleMaximize}
              className="w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 text-white  border-0 bg-transparent rounded-none"
              // style={{ color: iconDimColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isAccentDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.09)";
                e.currentTarget.style.color = iconColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = iconDimColor;
              }}
              title="Maximize"
              aria-label="Maximize"
            >
              <Square className="w-[12px] h-[12px] stroke-[1.5]" />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="w-12 h-full flex items-center justify-center cursor-pointer transition-colors duration-100 text-white  border-0 bg-transparent rounded-none"
              // style={{ color: iconDimColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e81123";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = iconDimColor;
              }}
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
