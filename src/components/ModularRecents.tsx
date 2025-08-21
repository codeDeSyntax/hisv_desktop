import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Mic2, LetterText } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

interface ModularRecentsProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  limit?: number;
}

const ModularRecents: React.FC<ModularRecentsProps> = ({
  className = "",
  showHeader = true,
  maxHeight = "100%",
  limit,
}) => {
  const { recentSermons, setSelectedMessage, setActiveTab, setRecentSermons } =
    useSermonContext();

  const { isDarkMode } = useTheme();

  const displayedSermons = limit
    ? recentSermons.slice(0, limit)
    : recentSermons;

  const handleDelete = (title: string) => {
    const updatedSermons = recentSermons.filter(
      (sermon) => sermon.title !== title
    );
    setRecentSermons(updatedSermons);
    localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
  };

  const handleSermonClick = (sermon: any) => {
    setSelectedMessage(sermon);
    setActiveTab("message");

    // If there's a lastParagraph stored, navigate to it after setting the sermon
    if (sermon.lastParagraph) {
      setTimeout(() => {
        const element = document.getElementById(
          `paragraph-${sermon.lastParagraph}`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); // Small delay to ensure the sermon content is rendered
    }

    // Update recent sermons list to move this sermon to the top
    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]"
    );
    const updatedRecentSermons = recentSermons.filter(
      (item: any) => item.id !== sermon.id
    );
    updatedRecentSermons.unshift(sermon);
    const limitedRecentSermons = updatedRecentSermons.slice(0, 15);
    localStorage.setItem("recentSermons", JSON.stringify(limitedRecentSermons));
    setRecentSermons(limitedRecentSermons);
  };

  return (
    <div
      className={`${className} h-full flex flex-col bg-transparent `}
      style={{ maxHeight }}
    >
      {showHeader && (
        <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700 ">
          {/* Search Input */}
          <div className="mb-4">
            <input
              placeholder="Search recent sermons..."
              className="w-[90%] p-3 text-sm bg-gray-50 dark:bg-primary border-none border-gray-300 dark:border-stone-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-[#42413f] text-stone-700 dark:text-white placeholder-gray-500"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        {displayedSermons.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-stone-700 dark:text-gray-300">
              No recent sermons
            </span>
          </div>
        ) : (
          <div className="h-full flex flex-col font-zilla backdrop-blur-sm rounded-lg border border-stone-200 dark:border-amber-900/30">
            {/* Fixed Table Header */}
            <div className="flex-shrink-0">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-amber-950/50 dark:to-stone-900/80">
                  <tr className="border-b border-stone-200 dark:border-amber-900/40">
                    <th className="text-left px-3 py-2.5 text-stone-700 dark:text-orange-200 font-medium text-sm font-zilla">
                      <span>Title</span>
                    </th>
                    <th className="text-center px-3 py-2.5 text-stone-700 dark:text-orange-200 font-medium text-sm font-zilla w-16">
                      Type
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full">
                <tbody className="divide-y divide-stone-100 dark:divide-amber-900/20">
                  <AnimatePresence>
                    {displayedSermons.map((sermon, index) => (
                      <motion.tr
                        key={`${sermon.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="cursor-pointer group transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-stone-50/80 dark:hover:from-amber-950/20 dark:hover:to-stone-900/20 hover:shadow-sm"
                        onClick={() => handleSermonClick(sermon)}
                      >
                        <td className="px-3 text-stone-800 dark:text-text group-hover:text-amber-700 dark:group-hover:text-text/60 transition-colors text-sm leading-tight font-zilla border-x-0 border-t-0 border-b border-solid border-stone-200 dark:border-text/20">
                          <span className="font-medium line-clamp-2 overflow-hidden">
                            {sermon.title}
                            {sermon.lastParagraph && (
                              <span className="ml-2 text-amber-600 dark:text-amber-400 font-bold">
                                #{sermon.lastParagraph}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 text-center w-16">
                          <div className="flex justify-center items-center gap-1">
                            {sermon.type === "mp3" ? (
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-amber-900/40 dark:to-yellow-800/40 shadow-sm transition-transform group-hover:scale-110">
                                <Mic2
                                  size={10}
                                  className="text-amber-600 dark:text-text ml-0.5"
                                />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-transform group-hover:scale-110">
                                <LetterText
                                  size={10}
                                  className="text-yellow-900 dark:text-text"
                                />
                              </div>
                            )}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(sermon.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all duration-200 ml-1"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 size={10} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModularRecents;
