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
  onSelect?: () => void;
}

const ModularRecents: React.FC<ModularRecentsProps> = ({
  className = "",
  showHeader = true,
  maxHeight = "100%",
  limit,
  onSelect,
}) => {
  const { recentSermons, setSelectedMessage, setActiveTab, setRecentSermons } =
    useSermonContext();

  const { isDarkMode, accentColor } = useTheme();

  const displayedSermons = limit
    ? recentSermons.slice(0, limit)
    : recentSermons;

  const handleDelete = (title: string) => {
    const updatedSermons = recentSermons.filter(
      (sermon) => sermon.title !== title,
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
          `paragraph-${sermon.lastParagraph}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); // Small delay to ensure the sermon content is rendered
    }

    // Update recent sermons list to move this sermon to the top
    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]",
    );
    const updatedRecentSermons = recentSermons.filter(
      (item: any) => item.id !== sermon.id,
    );
    updatedRecentSermons.unshift(sermon);
    const limitedRecentSermons = updatedRecentSermons.slice(0, 15);
    localStorage.setItem("recentSermons", JSON.stringify(limitedRecentSermons));
    setRecentSermons(limitedRecentSermons);

    // Close sidebar after selection
    onSelect?.();
  };

  return (
    <div
      className={`${className} h-full flex flex-col bg-transparent w-full max-w-2xl m-auto `}
      style={{ maxHeight }}
    >
      {showHeader && (
        <div className="flex-shrink-0 py-4 border-b border-zinc-200 dark:border-zinc-700 ">
          {/* Search Input */}
          <div className="mb-4">
            <input
              placeholder="Search recent sermons..."
              className="w-[90%] p-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent text-zinc-700 dark:text-zinc-100 placeholder-zinc-400"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        {displayedSermons.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-zinc-700 dark:text-zinc-300">
              No recent sermons
            </span>
          </div>
        ) : (
          <div className="h-full flex flex-col font-zilla rounded-lg border border-zinc-200 dark:border-zinc-700">
            {/* Fixed Table Header */}
            <div className="flex-shrink-0">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900">
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left px-3 py-2.5 text-zinc-700 dark:text-accent font-medium text-sm font-zilla">
                      <span>Title</span>
                    </th>
                    <th className="text-center px-3 py-2.5 text-zinc-700 dark:text-accent font-medium text-sm font-zilla w-16">
                      Type
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <table className="w-full">
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  <AnimatePresence>
                    {displayedSermons.map((sermon, index) => (
                      <motion.tr
                        key={`${sermon.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group relative py-2 rounded-lg border-solid border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 px-3 cursor-pointer hover:shadow-sm transition-colors duration-150"
                        onClick={() => handleSermonClick(sermon)}
                      >
                        <td className="px-3 rounded-xl py-2 text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors text-sm leading-tight font-zilla border-x-0 border-t-0 border-b border-solid border-zinc-200 dark:border-zinc-700">
                          <span className="font-medium line-clamp-2 overflow-hidden">
                            {sermon.title}
                            {sermon.lastParagraph && (
                              <span className="ml-2 text-zinc-600 dark:text-zinc-400 font-bold">
                                #{sermon.lastParagraph}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 text-center w-16 bg-transparent">
                          <div className="flex justify-center items-center gap-1">
                            {sermon.type === "mp3" ? (
                              <div
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-transform group-hover:scale-110"
                                style={{
                                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)`,
                                }}
                              >
                                <Mic2
                                  size={10}
                                  className="ml-0.5"
                                  style={{ color: accentColor }}
                                />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-transform group-hover:scale-110">
                                <LetterText
                                  size={10}
                                  className="text-zinc-700 dark:text-zinc-200"
                                />
                              </div>
                            )}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(sermon.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity duration-150 ml-1"
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
