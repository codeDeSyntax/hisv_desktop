import { memo } from "react";

interface HomeSideSkeletonProps {
  showProfile?: boolean;
  showSermons?: boolean;
}

const HomeSideSkeleton = memo(
  ({ showProfile = true, showSermons = true }: HomeSideSkeletonProps) => {
    return (
      <div className="h-screen relative flex items-center overflow-auto no-scrollbar w-screen bg-white dark:bg-background">
        <div className="relative z-10 h-[85%] w-[95%] m-auto flex items-center justify-center gap-1 p-8">
          {/* Left Side - Main Content Skeleton */}
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col w-[45%] h-[90%] bg-gray-100 dark:bg-background rounded-[20px]"
            style={{
              borderWidth: 6,
              borderColor: "#29252450",
              borderStyle: "dashed",
            }}
          >
            <div className="bg-white dark:bg-primary rounded-[20px] h-full">
              {/* Profile Header Skeleton */}
              {showProfile && (
                <div className="flex items-center justify-between mb-12 px-6 pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scripture Section Skeleton */}
              <div className="px-8 mb-8">
                <div className="backdrop-blur-sm px-8 py-6 rounded-lg border-l-4 border-white/30">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="mt-4 text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Sermon Archive Section */}
              {showSermons && (
                <div className="px-6">
                  {/* Archive Header */}
                  <div className="text-center py-6 px-6 border border-dashed border-gray-700 dark:border-text rounded-t-3xl">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                  </div>

                  {/* Archive Content */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="py-3 border-b border-gray-600 dark:border-gray-700 bg-gray-50 dark:bg-background -mx-2 px-2 rounded-xl"
                        >
                          {/* Title Row */}
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1 pr-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                            </div>
                            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>

                          {/* Details Row */}
                          <div className="flex justify-between items-center">
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Random Paragraph Skeleton */}
                  <div className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Receipt Tear Line */}
                  <div className="relative rounded-b-3xl">
                    <div className="absolute inset-x-0 flex justify-center rounded-b-3xl">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </div>
                    <div className="flex justify-center space-x-1 py-2 bg-white dark:bg-primary rounded-b-3xl">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Additional Content Skeleton */}
          <div className="w-[45%] h-[90%] flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HomeSideSkeleton.displayName = "HomeSideSkeleton";

export default HomeSideSkeleton;
