import React from "react";
import { Check } from "lucide-react";
import { ACCENT_COLORS } from "./data";

const AccentColorSection: React.FC<{
  accentColor: string;
  setAccentColor: (v: string) => void;
}> = ({ accentColor, setAccentColor }) => (
  <div>
    <h2 className="text-2xl font-semibold text-stone-900 dark:text-white mb-1">
      Accent color
    </h2>
    <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
      Personalise the interface. The chosen color is applied to active buttons,
      search highlights, window controls, and more.
    </p>

    <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900/40 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">
        Color palette
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
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
                  { backgroundColor: c.value, ringColor: c.value } as React.CSSProperties
                }
              >
                {selected && <Check className="w-4 h-4 text-white drop-shadow" />}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                {c.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live preview */}
      <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
        <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-3">Preview</p>
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
          <span className="text-xs font-semibold" style={{ color: accentColor }}>
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

export default AccentColorSection;
