import { memo } from "react";

interface SermonLoadSkeletonProps {
  count?: number;
  showSearch?: boolean;
  showHeader?: boolean;
}

const SermonLoadSkeleton = memo(
  ({
    count = 8,
    showSearch = true,
    showHeader = true,
  }: SermonLoadSkeletonProps) => {
    return (
      <div className="h-full w-full flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
        {showSearch && (
          <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="h-10 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          </div>
        )}

        {showHeader && (
          <div className="flex-shrink-0 flex items-center px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/60 select-none">
            <div className="flex-1">
              <div className="h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="w-14 flex justify-start">
              <div className="h-3 w-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="w-10 flex justify-center">
              <div className="h-3 w-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="h-full divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center">
                  <div className="flex-1 pr-3 min-w-0">
                    <div className="space-y-2">
                      <div
                        className="h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                        style={{ width: `${88 - (index % 4) * 8}%` }}
                      />
                      <div
                        className="h-3 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse"
                        style={{ width: `${60 + (index % 3) * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-14 flex justify-center">
                    <div className="h-6 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>

                  <div className="w-10 flex justify-center">
                    <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

SermonLoadSkeleton.displayName = "SermonLoadSkeleton";

export default SermonLoadSkeleton;
