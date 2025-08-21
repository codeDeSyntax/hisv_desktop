import React, { useState } from "react";
import { Bookmark, Clock } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import ModularBookmarks from "@/components/ModularBookmarks";
import ModularRecents from "@/components/ModularRecents";

const CombinedBookmarksRecents = () => {
  const { isDarkMode } = useTheme();
  const [activeSide, setActiveSide] = useState<"bookmarks" | "recents">(
    "bookmarks"
  );

  return (
    <div className="h-screen w-full bg-white dark:bg-primary/20 flex items-center justify-center pt-2">
      {/* Main Container - Centered with proper gap */}
      <div className="flex items-center justify-center w-[95%] h-[100vh] gap-4 px-6 pb-2">
        {/* Left side - Bookmarks (70%) */}
        <div className="w-[70%] dark:shadow-[#794b0e] shadow   h-[90%] flex flex-col items-center overflow-hidden relative rounded-3xl bg-white dark:bg-primary/20">
          <div className="backdrop-blur-md bg-stone-100 dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full">
            {/* Fixed Header */}
            <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-amber-600 dark:text-orange-400" />
                <h2 className="text-lg font-semibold text-stone-800 dark:text-orange-200 font-zilla ">
                  Bookmarks
                </h2>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className=" overflow-hidden">
              <ModularBookmarks
                className="h-full"
                showHeader={false}
                maxHeight="100%"
              />
            </div>
          </div>
        </div>

        {/* Right side - Recents (30%) */}
        <div className="w-[30%] h-[90%] flex flex-col relative rounded-3xl bg-[#f9fafb] dark:bg-primary/20 overflow-hidden dark:shadow-[#794b0e] shadow">
          <div className="backdrop-blur-md bg-stone-100 dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full rounded-3xl dark:shadow-[#543915] shadow">
            {/* Fixed Header */}
            <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg font-semibold text-stone-800 dark:text-orange-200 font-zilla">
                  Recent Activity
                </h2>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden">
              <ModularRecents
                className="h-full"
                showHeader={false}
                maxHeight="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedBookmarksRecents;
