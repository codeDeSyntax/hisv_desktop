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
  const [presentationFontSize, setPresentationFontSize] = useState<number>(
    Number(settings.presentationFontSize ?? settings.fontSize ?? 36),
  );
  const [fontWeight, setFontWeight] = useState(settings.fontWeight);
  const [fontStyle, setFontStyle] = useState(settings.fontStyle);
  const [readingWidth, setReadingWidth] = useState<number>(
    Number(settings.readingWidth ?? 100),
  );
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("reading");
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(true);
  const [autoDownloadUpdates, setAutoDownloadUpdates] = useState(false);

  useEffect(() => {
    const next = {
      ...settings,
      fontSize: fontSize.toString(),
      presentationFontSize: presentationFontSize.toString(),
      fontWeight,
      fontStyle,
      readingWidth: readingWidth.toString(),
    };
    setSettings(next);
    localStorage.setItem("sermonSettings", JSON.stringify(next));
    setShowSaveNotification(true);
    const t = setTimeout(() => setShowSaveNotification(false), 1800);
    return () => clearTimeout(t);
  }, [fontSize, presentationFontSize, fontWeight, fontStyle, readingWidth]);

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
    <div className="h-full max-w-2xl m-auto flex flex-col bg-white dark:bg-zinc-950 overflow-hidden font-outfit">
      {/* Save toast */}
      {showSaveNotification && (
        <div className="fixed top-16 right-6 z-50 bg-white dark:bg-zinc-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg border border-zinc-100 dark:border-zinc-700">
          <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            Saved
          </span>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800 px-3 pt-4 pb-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-1">
          {NAV_SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`relative whitespace-nowrap px-3 py-2 text-[13px] rounded-t-lg transition-colors font-medium ${
                  active
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
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
            presentationFontSize={presentationFontSize}
            setPresentationFontSize={setPresentationFontSize}
            fontWeight={fontWeight}
            setFontWeight={setFontWeight}
            fontStyle={fontStyle}
            setFontStyle={setFontStyle}
            readingWidth={readingWidth}
            setReadingWidth={setReadingWidth}
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
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default FontSettingsPage;
