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
      <div className="h-screen w-full bg-white dark:bg-background flex items-center justify-center pt-2">
        <div className="flex items-center justify-center w-[95%] h-[88vh] gap-4 px-6 pb-2">
          {/* Left side - Sermon List Skeleton */}
          <div className="w-1/2 h-full flex flex-col relative dark:shadow-[#543915] shadow rounded-3xl bg-white dark:bg-primary">
            <div className="backdrop-blur-md bg-white dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full">
              {/* Search Skeleton */}
              {showSearch && (
                <div className="flex-shrink-0 py-4 border-b border-stone-200 dark:border-stone-700">
                  <div className="mb-4">
                    <div className="w-[90%] h-12 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col font-zilla backdrop-blur-sm rounded-lg border border-stone-200 dark:border-amber-900/30">
                  {/* Table Header Skeleton */}
                  {showHeader && (
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-amber-950/50 dark:to-stone-900/80">
                        <div className="border-b border-stone-200 dark:border-amber-900/40 p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="h-4 bg-stone-300 dark:bg-stone-600 rounded w-16 animate-pulse"></div>
                            </div>
                            <div className="w-20">
                              <div className="h-4 bg-stone-300 dark:bg-stone-600 rounded w-12 animate-pulse"></div>
                            </div>
                            <div className="w-16 text-center">
                              <div className="h-4 bg-stone-300 dark:bg-stone-600 rounded w-10 mx-auto animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table Body Skeleton */}
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="divide-y divide-stone-100 dark:divide-amber-900/20">
                      {Array.from({ length: count }).map((_, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-stone-50/80 dark:hover:from-amber-950/20 dark:hover:to-stone-900/20 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            {/* Title Skeleton */}
                            <div className="flex-1 pr-3">
                              <div className="space-y-2">
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-full"></div>
                                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4"></div>
                              </div>
                            </div>

                            {/* Year Badge Skeleton */}
                            <div className="w-20 flex justify-center">
                              <div className="h-6 w-12 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse"></div>
                            </div>

                            {/* Type Icon Skeleton */}
                            <div className="w-16 flex justify-center">
                              <div className="w-7 h-7 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Search Skeleton */}
          <div className="w-1/2 h-full">
            <SearchSkeleton />
          </div>
        </div>
      </div>
    );
  }
);

// Search Panel Skeleton Component
const SearchSkeleton = memo(() => {
  return (
    <div className="h-full bg-white dark:bg-primary rounded-3xl shadow-lg dark:shadow-[#543915] p-6">
      {/* Search Header */}
      <div className="mb-6">
        <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-32 mb-4 animate-pulse"></div>
        <div className="h-12 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse"></div>
      </div>

      {/* Search Results Skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-48 animate-pulse"></div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-stone-200 dark:border-stone-600 pb-4"
          >
            {/* Sermon Title */}
            <div className="mb-2">
              <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-4/5 animate-pulse"></div>
            </div>

            {/* Match Preview */}
            <div className="space-y-2">
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Paragraph Number */}
            <div className="mt-2">
              <div className="h-4 w-12 bg-stone-200 dark:bg-stone-700 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SermonLoadSkeleton.displayName = "SermonLoadSkeleton";
SearchSkeleton.displayName = "SearchSkeleton";

export default SermonLoadSkeleton;
