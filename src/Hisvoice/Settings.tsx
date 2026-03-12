import React, { useState, useEffect } from "react";
import { Type, Eye, Palette, Check, Monitor, Sun, Moon } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

// â”€â”€ Accent colour swatches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ACCENT_COLORS = [
  { name: "Sage", value: "#10a37f" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Teal", value: "#0d9488" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Stone", value: "#78716c" },
  { name: "Crimson", value: "#dc2626" },
];

// â”€â”€ Toggle switch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Toggle: React.FC<{
  on: boolean;
  onChange: () => void;
  accentColor: string;
}> = ({ on, onChange, accentColor }) => (
  <button
    onClick={onChange}
    className="relative inline-flex h-5 w-10 items-center rounded-full transition-colors flex-shrink-0"
    style={{ backgroundColor: on ? accentColor : undefined }}
    data-off={on ? undefined : true}
  >
    <span
      className={`
        inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
        ${on ? "translate-x-5" : "translate-x-0.5"}
      `}
    />
  </button>
);

// â”€â”€ Setting row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SettingRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
  active?: boolean;
  accentColor?: string;
}> = ({ icon, title, description, control, active, accentColor }) => (
  <div
    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-colors ${
      active
        ? "border-transparent"
        : "border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900/40"
    }`}
    style={
      active
        ? {
            backgroundColor: accentColor ? `${accentColor}15` : undefined,
            borderColor: accentColor ? `${accentColor}40` : undefined,
          }
        : undefined
    }
  >
    <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13.5px] font-medium text-stone-900 dark:text-white leading-tight">
        {title}
      </div>
      <div className="text-[11.5px] text-stone-500 dark:text-stone-400 mt-0.5">
        {description}
      </div>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FontSettingsPage = () => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode, toggleDarkMode, accentColor, setAccentColor } =
    useTheme();

  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "reading" | "appearance" | "accent"
  >("reading");

  const autoSave = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem("sermonSettings", JSON.stringify(newSettings));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 1800);
  };

  useEffect(() => {
    autoSave({
      ...settings,
      fontSize: fontSize.toString(),
      fontWeight,
      fontStyle,
    });
  }, [fontSize, fontWeight, fontStyle]);

  // â”€â”€ nav sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navSections = [
    { id: "reading" as const, label: "Reading" },
    { id: "appearance" as const, label: "Appearance" },
    { id: "accent" as const, label: "Accent color" },
  ];

  return (
    <div className="h-full w-full flex bg-white dark:bg-stone-950 overflow-hidden font-outfit">
      {/* â”€â”€ Save toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showSaveNotification && (
        <div className="fixed top-16 right-6 z-50 bg-white dark:bg-stone-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg border border-stone-100 dark:border-stone-700">
          <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
            Saved
          </span>
        </div>
      )}

      {/* â”€â”€ Left nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="w-44 flex-shrink-0 border-r border-stone-100 dark:border-stone-800 py-6 px-3 flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 px-2 mb-2">
          Customize
        </p>
        {navSections.map((s) => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors font-medium ${
                active
                  ? "text-stone-900 dark:text-white"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}
              style={
                active
                  ? { backgroundColor: `${accentColor}20`, color: accentColor }
                  : undefined
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* â”€â”€ Right content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
        {/* â”€â”€ READING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeSection === "reading" && (
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-white mb-1">
              Reading
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              Adjust how sermon text appears while you read.
            </p>

            <div className="space-y-2">
              {/* Font size row */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900/40 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-stone-900 dark:text-white">
                      Font size
                    </div>
                    <div className="text-[11.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Currently {fontSize}px
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {fontSize}px
                  </span>
                </div>
                {/* Slider always visible */}
                <div className="px-4 pb-4 pt-0 border-t border-stone-100 dark:border-stone-800">
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-stone-200 dark:bg-stone-700"
                    style={{ accentColor }}
                  />
                  <div className="flex justify-between mt-1.5 text-[10px] text-stone-400 dark:text-stone-500">
                    <span>12px</span>
                    <span>120px</span>
                  </div>
                </div>
              </div>

              {/* Font weight */}
              <SettingRow
                icon={
                  <Type className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                }
                title="Font weight"
                description="Normal or bold text while reading"
                control={
                  <div className="flex gap-1">
                    {(["normal", "bold"] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setFontWeight(w)}
                        className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-colors ${
                          fontWeight === w
                            ? "text-white shadow-sm"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                        }`}
                        style={
                          fontWeight === w
                            ? { backgroundColor: accentColor }
                            : undefined
                        }
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                }
              />

              {/* Font style */}
              <SettingRow
                icon={
                  <Type className="w-4 h-4 text-stone-600 dark:text-stone-400 italic" />
                }
                title="Text style"
                description="Render text as normal or italic"
                control={
                  <div className="flex gap-1">
                    {(["normal", "italic"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontStyle(s)}
                        className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-colors ${
                          fontStyle === s
                            ? "text-white shadow-sm"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                        }`}
                        style={
                          fontStyle === s
                            ? { backgroundColor: accentColor }
                            : { fontStyle: s }
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                }
              />

              {/* Preview */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900/40 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-medium text-stone-900 dark:text-white">
                      Preview
                    </div>
                    <div className="text-[11.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Live preview of your reading settings
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 bg-stone-50 dark:bg-stone-950/60">
                  <p
                    style={{
                      fontFamily: settings.fontFamily,
                      fontSize: `${fontSize}px`,
                      fontWeight,
                      fontStyle,
                    }}
                    className="text-stone-900 dark:text-white leading-relaxed"
                  >
                    And the LORD said unto Moses, Go, get thee down; for thy
                    people, which thou broughtest out of the land of Egypt, have
                    corrupted themselves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€ APPEARANCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeSection === "appearance" && (
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-white mb-1">
              Appearance
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              Choose how the application looks on your display.
            </p>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 px-1 pb-1">
                Theme
              </p>
              <SettingRow
                icon={
                  isDarkMode ? (
                    <Moon className="w-4 h-4 text-stone-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )
                }
                title="Dark mode"
                description={
                  isDarkMode ? "Using dark theme" : "Using light theme"
                }
                active={isDarkMode}
                accentColor={accentColor}
                control={
                  <Toggle
                    on={isDarkMode}
                    onChange={toggleDarkMode}
                    accentColor={accentColor}
                  />
                }
              />
            </div>
          </div>
        )}

        {/* â”€â”€ ACCENT COLOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeSection === "accent" && (
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-white mb-1">
              Accent color
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              Personalise the interface. The chosen color is applied to active
              buttons, search highlights, window controls, and more.
            </p>

            <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">
                Color palette
              </p>
              <div className="grid grid-cols-5 gap-3">
                {ACCENT_COLORS.map((c) => {
                  const selected = accentColor === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setAccentColor(c.value)}
                      title={c.name}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <span
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${
                          selected
                            ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={
                          {
                            backgroundColor: c.value,
                            ringColor: c.value,
                          } as React.CSSProperties
                        }
                      >
                        {selected && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live preview strip */}
              <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-3">
                  Preview
                </p>
                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    Search
                  </button>
                  <div
                    className="h-2 flex-1 rounded-full opacity-30"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: accentColor }}
                  >
                    Active link
                  </span>
                  <div
                    className="w-8 h-5 rounded-full flex items-center justify-end px-0.5"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow block" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FontSettingsPage;
