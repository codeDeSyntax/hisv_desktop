import { memo } from "react";

interface SermonContentSkeletonProps {
  paragraphCount?: number;
  showHeader?: boolean;
  showControls?: boolean;
}

const SermonContentSkeleton = memo(
  ({
    paragraphCount = 8,
    showHeader = true,
    showControls = true,
  }: SermonContentSkeletonProps) => {
    return (
      <div className="bg-white dark:bg-background h-screen relative w-screen">
        {/* Floating Control Button Skeleton */}
        {showControls && (
          <div className="fixed top-20 right-6 z-50">
            <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse"></div>
          </div>
        )}

        <div className="bg-center flex flex-col pb-10">
          <div className="mb-5 h-full">
            <div className="rounded-lg px-4 h-[100vh] overflow-y-scroll no-scrollbar text-wrap">
              <div className="h-full mx-auto px-12">
                {/* Text Color Selector Skeleton */}
                <div className="mb-6 pt-6">
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Sermon Header Skeleton */}
                {showHeader && (
                  <div className="text-center mb-12">
                    <div className="space-y-4">
                      <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mx-auto animate-pulse"></div>
                      <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mx-auto animate-pulse"></div>
                      <div className="flex justify-center space-x-4 mt-4">
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sermon Paragraphs Skeleton */}
                <div className="space-y-6 relative">
                  {Array.from({ length: paragraphCount }).map((_, index) => (
                    <div key={index} className="relative group bg-transparent">
                      {/* Bookmark Button Skeleton */}
                      <div className="absolute -right-12 top-2 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse opacity-30"></div>

                      {/* Paragraph Content Skeleton */}
                      <div className="leading-relaxed bg-transparent py-2 rounded-r-lg border-l-4 border-transparent">
                        <div className="space-y-3">
                          {/* Paragraph Number */}
                          <div className="flex items-start">
                            <div className="h-4 w-6 bg-stone-200 dark:bg-stone-700 rounded mr-2 animate-pulse flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-full animate-pulse"></div>
                              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-11/12 animate-pulse"></div>
                              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-5/6 animate-pulse"></div>
                              {/* Randomly vary paragraph lengths */}
                              {Math.random() > 0.5 && (
                                <>
                                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-4/5 animate-pulse"></div>
                                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 animate-pulse"></div>
                                </>
                              )}
                              {Math.random() > 0.7 && (
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-2/3 animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loading More Indicator */}
                <div className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-stone-400 dark:bg-stone-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <div className="mt-2">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-32 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SermonContentSkeleton.displayName = "SermonContentSkeleton";

export default SermonContentSkeleton;
