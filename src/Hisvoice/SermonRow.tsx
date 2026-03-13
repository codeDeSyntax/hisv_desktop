import * as React from "react";
import { memo } from "react";
import { Mic2, FileText } from "lucide-react";
import { Sermon } from "@/types/index";

interface SermonRowProps {
  sermon: Sermon;
  onRowClick: (sermon: Sermon) => void;
  id: number;
}

const SermonRow = memo(
  ({ sermon, onRowClick, id }: SermonRowProps) => (
    <div
      className={`flex items-center px-4 py-2 border-solid cursor-pointer group transition-colors duration-100 hover:bg-stone-50 dark:hover:bg-stone-900/60 border-b border-stone-50 dark:border-stone-900/40 ${id % 2 === 0 ? "bg-stone-100 dark:bg-stone-800/50" : "bg-white dark:bg-stone-900/40"}  `}
      onClick={() => onRowClick(sermon)}
    >
      {/* Title */}
      <div className="flex-1 min-w-0 pr-3">
        <span className="text-[13px] font-medium text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors line-clamp-1 ">
          {sermon.title}
        </span>
      </div>
      {/* Year */}
      <div className="w-14 flex-shrink-0">
        <span className="text-xs text-stone-400 dark:text-stone-500 font-zilla">
          {sermon.year || "—"}
        </span>
      </div>
      {/* Type */}
      <div className="w-10 flex-shrink-0 flex justify-center">
        <div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center group-hover:bg-stone-200 dark:group-hover:bg-stone-700/60 transition-colors">
          {sermon.type === "mp3" ? (
            <Mic2 size={9} className="text-stone-500 dark:text-stone-400" />
          ) : (
            <FileText size={9} className="text-stone-500 dark:text-stone-400" />
          )}
        </div>
      </div>
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.sermon.id === nextProps.sermon.id &&
    prevProps.sermon.title === nextProps.sermon.title &&
    prevProps.sermon.type === nextProps.sermon.type,
);

SermonRow.displayName = "SermonRow";

export default SermonRow;
