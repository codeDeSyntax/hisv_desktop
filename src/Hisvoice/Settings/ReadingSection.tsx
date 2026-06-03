import React from "react";
import { Type, Eye, Monitor, Maximize2 } from "lucide-react";
import SettingRow from "./SettingRow";
import OptionButtons from "./OptionButtons";

const ReadingSection: React.FC<{
  fontSize: number;
  setFontSize: (v: number) => void;
  presentationFontSize: number;
  setPresentationFontSize: (v: number) => void;
  fontWeight: string;
  setFontWeight: (v: string) => void;
  fontStyle: string;
  setFontStyle: (v: string) => void;
  readingWidth: number;
  setReadingWidth: (v: number) => void;
  fontFamily: string;
  accentColor: string;
}> = ({
  fontSize,
  setFontSize,
  presentationFontSize,
  setPresentationFontSize,
  fontWeight,
  setFontWeight,
  fontStyle,
  setFontStyle,
  readingWidth,
  setReadingWidth,
  fontFamily,
  accentColor,
}) => (
  <div>
    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-1">
      Reading
    </h2>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
      Adjust how sermon text appears while you read.
    </p>

    <div className="space-y-2">
      {/* Reader font size */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium text-zinc-900 dark:text-white">
              Reader font size
            </div>
            <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
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
        <div className="px-4 pb-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700"
            style={{ accentColor }}
          />
          <div className="flex justify-between mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>12px</span>
            <span>120px</span>
          </div>
        </div>
      </div>

      {/* Presentation font size */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Monitor className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium text-zinc-900 dark:text-white">
              Presentation font size
            </div>
            <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Currently {presentationFontSize}px
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
            style={{ backgroundColor: accentColor }}
          >
            {presentationFontSize}px
          </span>
        </div>
        <div className="px-4 pb-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
          <input
            type="range"
            min="12"
            max="120"
            value={presentationFontSize}
            onChange={(e) => setPresentationFontSize(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700"
            style={{ accentColor }}
          />
          <div className="flex justify-between mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>12px</span>
            <span>120px</span>
          </div>
        </div>
      </div>

      {/* Font weight */}
      <SettingRow
        icon={<Type className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}
        title="Font weight"
        description="Normal or bold text while reading"
        control={
          <OptionButtons
            options={["thin","normal", "bold"] as const}
            value={fontWeight}
            onChange={setFontWeight}
            accentColor={accentColor}
          />
        }
      />

      {/* Reading width */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Maximize2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium text-zinc-900 dark:text-white">
              Reading width
            </div>
            <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Currently {readingWidth}% of the available space
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md text-white"
            style={{ backgroundColor: accentColor }}
          >
            {readingWidth}%
          </span>
        </div>
        <div className="px-4 pb-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
          <input
            type="range"
            min="60"
            max="100"
            value={readingWidth}
            onChange={(e) => setReadingWidth(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700"
            style={{ accentColor }}
          />
          <div className="flex justify-between mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span>60%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Font style */}
      <SettingRow
        icon={
          <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-400 italic" />
        }
        title="Text style"
        description="Render text as normal or italic"
        control={
          <OptionButtons
            options={["normal", "italic"] as const}
            value={fontStyle}
            onChange={setFontStyle}
            accentColor={accentColor}
            styleOverride={(opt, active) =>
              active ? { backgroundColor: accentColor } : { fontStyle: opt }
            }
          />
        }
      />

      {/* Preview */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Monitor className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <div className="text-[13.5px] font-medium text-zinc-900 dark:text-white">
              Preview
            </div>
            <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live preview of your reading settings
            </div>
          </div>
        </div>
        <div className="px-4 py-4 bg-zinc-50 dark:bg-zinc-950/60">
          <p
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight,
              fontStyle,
            }}
            className="text-zinc-900 dark:text-white leading-relaxed"
          >
            And the LORD said unto Moses, Go, get thee down; for thy people,
            which thou broughtest out of the land of Egypt, have corrupted
            themselves.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ReadingSection;
