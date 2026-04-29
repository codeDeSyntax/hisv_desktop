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
      className={`flex items-center px-4 py-2 border-so cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-900 border-b border-zinc-50 dark:border-zinc-900   `}
      onClick={() => onRowClick(sermon)}
    >
      {/* Title */}
      <div className="flex-1 flex min-w-0 pr-3">
        <span className="text-[14px] font-mediu text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 line-clamp-1 ">
          {id + 1}
        </span>
        <span className="text-[14px] font-thin text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 line-clamp-1 ">
          {". "}
          {sermon.title}
        </span>
      </div>
      {/* Year */}
      <div className="w-14 flex-shrink-0">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-zilla">
          {sermon.year || "—"}
        </span>
      </div>
      {/* Type */}
      <div className="w-10 flex-shrink-0 flex justify-center">
        <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700">
          {sermon.type === "mp3" ? (
            <Mic2 size={9} className="text-zinc-500 dark:text-zinc-400" />
          ) : (
            <FileText size={9} className="text-zinc-500 dark:text-zinc-400" />
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
