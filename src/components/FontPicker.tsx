import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Type, ChevronDown, Check } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

const FONTS = ["Outfit", "Fraunces"];

const FontPicker: React.FC = () => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode, accentColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.right, // will be shifted left via transform in the portal
      });
    }
    setIsOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleFontChange = (font: string) => {
    const newSettings = { ...settings, fontFamily: font };
    setSettings(newSettings);
    localStorage.setItem("sermonSettings", JSON.stringify(newSettings));
    setIsOpen(false);
  };

  const dropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="font-picker-dropdown"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.13 }}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateX(-100%)",
            zIndex: 99999,
            minWidth: 160,
          }}
          className={`rounded-xl shadow-2xl border py-1 ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-700/80"
              : "bg-white border-zinc-200"
          }`}
          // stop clicks from bubbling to the outside-click handler
          onMouseDown={(e) => e.stopPropagation()}
        >
          {FONTS.map((font) => {
            const active = settings.fontFamily === font;
            return (
              <div
                key={font}
                onClick={() => handleFontChange(font)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  active
                    ? isDarkMode
                      ? "text-zinc-100"
                      : "text-zinc-900"
                    : isDarkMode
                      ? "hover:bg-zinc-800/60 text-zinc-300"
                      : "hover:bg-zinc-50 text-zinc-700"
                }`}
                style={{
                  fontFamily: font,
                  ...(active ? { backgroundColor: accentColor + "20" } : {}),
                }}
              >
                <span className="text-sm">{font}</span>
                {active && (
                  <Check
                    className="w-[14px] h-[14px] flex-shrink-0"
                    style={{ color: accentColor }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      className="relative"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
          isDarkMode
            ? "hover:bg-zinc-800 text-zinc-300"
            : "hover:bg-zinc-100 text-zinc-700"
        }`}
        title="Select Sermon Font"
      >
        <Type className="w-[18px] h-[18px]" />
        <span className="text-sm font-medium">{settings.fontFamily || "Outfit"}</span>
        <ChevronDown
          className={`w-[14px] h-[14px] transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Render dropdown through portal to escape TitleBar stacking context */}
      {ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};

export default FontPicker;
