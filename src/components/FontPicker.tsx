import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Type, ChevronDown, Check } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

const FONTS = [
  { name: "Outfit", label: "Outfit", desc: "Clean geometric sans" },
  { name: "Fraunces", label: "Fraunces", desc: "Editorial serif display" },
  { name: "Lora", label: "Lora", desc: "Contemporary reading serif" },
  { name: "Merriweather", label: "Merriweather", desc: "Sturdy screen reading serif" },
];

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
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            top: 40,
            left: "70%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            minWidth: 200,
          }}
          className={`rounded-xl shadow-xl border p-1 backdrop-blur-md ${
            isDarkMode
              ? "bg-neutral-700 border-zinc-800/80"
              : "bg-white/85 border-zinc-200/60"
          }`}
          // stop clicks from bubbling to the outside-click handler
          onMouseDown={(e) => e.stopPropagation()}
        >
          {FONTS.map((font) => {
            const active = settings.fontFamily === font.name;
            return (
              <div
                key={font.name}
                onClick={() => handleFontChange(font.name)}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  active
                    ? isDarkMode
                      ? "text-white"
                      : "text-zinc-950"
                    : isDarkMode
                      ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                      : "hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800"
                }`}
                style={{
                  fontFamily: font.name,
                  ...(active ? { backgroundColor: accentColor + "18" } : {}),
                }}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-semibold tracking-wide leading-normal">
                    {font.label}
                  </span>
                  <span className="text-[9px] font-sans text-zinc-500 dark:text-neutral-300 font-normal truncate mt-0.5">
                    {font.desc}
                  </span>
                </div>
                {active && (
                  <Check
                    className="w-[12px] h-[12px] flex-shrink-0"
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
        className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border-none  text-xs font-semibold transition-all duration-150 cursor-pointer ${
          isDarkMode
            ? "bg-neutral-800 hover:bg-neutral-800/60"
            : "bg-neutral-100 hover:bg-neutral-100/85"
        }`}
       
        title="Select Sermon Font"
      >
        <Type className="w-[13px] h-[13px] text-black dark:text-white" />
        <span className="font-sans text-black dark:text-white" >{settings.fontFamily || "Outfit"}</span>
        <ChevronDown
          className={`w-[11px] h-[11px] text-black dark:text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          
        />
      </button>

      {/* Render dropdown through portal to escape TitleBar stacking context */}
      {ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};

export default FontPicker;
