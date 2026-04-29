import React from "react";
import { Check } from "lucide-react";
import { ACCENT_COLORS_LIGHT, ACCENT_COLORS_DARK } from "./data";

const AccentColorSection: React.FC<{
  accentColor: string;
  setAccentColor: (v: string) => void;
  isDarkMode: boolean;
}> = ({ accentColor, setAccentColor, isDarkMode }) => {
  const colors = isDarkMode ? ACCENT_COLORS_DARK : ACCENT_COLORS_LIGHT;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-1">
        Accent color
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Personalise the interface. The chosen color is applied to active
        buttons, search highlights, window controls, and more.
      </p>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
          Color palette
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {colors.map((c) => {
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
                      ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110"
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
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live preview */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-3">
            Preview
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Search
            </button>
            <div
              className="h-2 flex-1 min-w-[40px] rounded-full opacity-30"
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
  );
};

export default AccentColorSection;
