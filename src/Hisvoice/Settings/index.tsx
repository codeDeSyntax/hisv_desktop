import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { NAV_SECTIONS, SectionId } from "./data";
import ReadingSection from "./ReadingSection";
import AppearanceSection from "./AppearanceSection";
import AccentColorSection from "./AccentColorSection";

type UpdatePrefs = {
  autoCheck: boolean;
  autoDownload: boolean;
};

const FontSettingsPage = () => {
  const { settings, setSettings } = useSermonContext();
  const { isDarkMode, toggleDarkMode, accentColor, setAccentColor } =
    useTheme();

  const [fontSize, setFontSize] = useState<number>(Number(settings.fontSize));
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("reading");
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(true);
  const [autoDownloadUpdates, setAutoDownloadUpdates] = useState(false);

  useEffect(() => {
    const next = {
      ...settings,
      fontSize: fontSize.toString(),
      fontWeight,
      fontStyle,
    };
    setSettings(next);
    localStorage.setItem("sermonSettings", JSON.stringify(next));
    setShowSaveNotification(true);
    const t = setTimeout(() => setShowSaveNotification(false), 1800);
    return () => clearTimeout(t);
  }, [fontSize, fontWeight, fontStyle]);

  useEffect(() => {
    window.ipcRenderer
      .invoke("get-update-preference")
      .then((prefs: Partial<UpdatePrefs>) => {
        setAutoCheckUpdates(prefs?.autoCheck ?? true);
        setAutoDownloadUpdates(prefs?.autoDownload ?? false);
      })
      .catch(() => {});
  }, []);

  const saveUpdatePrefs = async (next: Partial<UpdatePrefs>) => {
    await window.ipcRenderer
      .invoke("set-update-preference", next)
      .catch(() => {});
  };

  const toggleAutoCheckUpdates = async () => {
    const next = !autoCheckUpdates;
    setAutoCheckUpdates(next);
    await saveUpdatePrefs({ autoCheck: next });
  };

  const toggleAutoDownloadUpdates = async () => {
    const next = !autoDownloadUpdates;
    setAutoDownloadUpdates(next);
    await saveUpdatePrefs({ autoDownload: next });
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-stone-950 overflow-hidden font-outfit">
      {/* Save toast */}
      {showSaveNotification && (
        <div className="fixed top-16 right-6 z-50 bg-white dark:bg-stone-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg border border-stone-100 dark:border-stone-700">
          <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
            Saved
          </span>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex-shrink-0 border-b border-stone-100 dark:border-stone-800 px-3 pt-4 pb-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-1">
          {NAV_SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`relative whitespace-nowrap px-3 py-2 text-[13px] rounded-t-lg transition-colors font-medium ${
                  active
                    ? "text-stone-900 dark:text-white"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900"
                }`}
                style={active ? { color: accentColor } : undefined}
              >
                {s.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-5 py-5">
        {activeSection === "reading" && (
          <ReadingSection
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontWeight={fontWeight}
            setFontWeight={setFontWeight}
            fontStyle={fontStyle}
            setFontStyle={setFontStyle}
            fontFamily={settings.fontFamily}
            accentColor={accentColor}
          />
        )}
        {activeSection === "appearance" && (
          <AppearanceSection
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            accentColor={accentColor}
            autoCheckUpdates={autoCheckUpdates}
            autoDownloadUpdates={autoDownloadUpdates}
            toggleAutoCheckUpdates={toggleAutoCheckUpdates}
            toggleAutoDownloadUpdates={toggleAutoDownloadUpdates}
          />
        )}
        {activeSection === "accent" && (
          <AccentColorSection
            accentColor={accentColor}
            setAccentColor={setAccentColor}
          />
        )}
      </div>
    </div>
  );
};

export default FontSettingsPage;
