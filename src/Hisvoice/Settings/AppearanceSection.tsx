import React from "react";
import { Sun, Moon, RefreshCw, Download } from "lucide-react";
import SettingRow from "./SettingRow";
import Toggle from "./Toggle";

const AppearanceSection: React.FC<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  accentColor: string;
  autoCheckUpdates: boolean;
  autoDownloadUpdates: boolean;
  toggleAutoCheckUpdates: () => void;
  toggleAutoDownloadUpdates: () => void;
}> = ({
  isDarkMode,
  toggleDarkMode,
  accentColor,
  autoCheckUpdates,
  autoDownloadUpdates,
  toggleAutoCheckUpdates,
  toggleAutoDownloadUpdates,
}) => (
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
        description={isDarkMode ? "Using dark theme" : "Using light theme"}
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

      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 px-1 pb-1 pt-2">
        Updates
      </p>
      <SettingRow
        icon={
          <RefreshCw className="w-4 h-4 text-stone-600 dark:text-stone-400" />
        }
        title="Auto-check updates"
        description="Check for new versions automatically on startup"
        active={autoCheckUpdates}
        accentColor={accentColor}
        control={
          <Toggle
            on={autoCheckUpdates}
            onChange={toggleAutoCheckUpdates}
            accentColor={accentColor}
          />
        }
      />
      <SettingRow
        icon={
          <Download className="w-4 h-4 text-stone-600 dark:text-stone-400" />
        }
        title="Auto-download updates"
        description="Download available updates automatically"
        active={autoDownloadUpdates}
        accentColor={accentColor}
        control={
          <Toggle
            on={autoDownloadUpdates}
            onChange={toggleAutoDownloadUpdates}
            accentColor={accentColor}
          />
        }
      />
    </div>
  </div>
);

export default AppearanceSection;
