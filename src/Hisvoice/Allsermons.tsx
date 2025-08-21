import { useContext, useState, useMemo, useCallback, memo } from "react";
import { Tooltip } from "antd";
import { CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  LetterTextIcon,
  Mic,
  Play,
  FileText,
  LetterText,
  BookAudio,
  Mic2,
} from "lucide-react";
import Search from "./Search.js";
import { useSermonContext } from "@/Provider/Vsermons.js";
import { Sermon } from "@/types/index.js";
import { useTheme } from "@/Provider/Theme.js";
import SermonLoadSkeleton from "@/components/SermonLoadSkeleton";

const SermonList = memo(() => {
  const {
    allSermons,
    loading,
    error,
    setActiveTab,
    setSelectedMessage,
    setRecentSermons,
  } = useSermonContext();

  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { isDarkMode } = useTheme();

  const filteredSermons = useMemo(() => {
    return allSermons.filter((sermon) =>
      sermon.title.toString().toLowerCase().includes(searchText.toLowerCase())
    );
  }, [allSermons, searchText]);

  const sortedSermons = useMemo(() => {
    let sorted = [...filteredSermons];

    if (sortField) {
      sorted.sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        if (sortField === "title") {
          aValue = a.title;
          bValue = b.title;
        } else if (sortField === "year") {
          aValue = Number(a.year) || 0;
          bValue = Number(b.year) || 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortOrder === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [filteredSermons, sortField, sortOrder]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField, sortOrder]
  );

  const handleSermonClick = useCallback(
    (sermon: Sermon) => {
      setSelectedMessage(sermon);
      setActiveTab("message");

      const recentSermons = JSON.parse(
        localStorage.getItem("recentSermons") || "[]"
      );
      const updatedRecentSermons = recentSermons.filter(
        (item: Sermon) => item.id !== sermon.id
      );
      updatedRecentSermons.unshift(sermon);
      const limitedRecentSermons = updatedRecentSermons.slice(0, 15);
      localStorage.setItem(
        "recentSermons",
        JSON.stringify(limitedRecentSermons)
      );
      setRecentSermons(limitedRecentSermons);
    },
    [setSelectedMessage, setActiveTab, setRecentSermons]
  );

  if (loading) {
    return (
      <SermonLoadSkeleton count={10} showSearch={true} showHeader={true} />
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white dark:bg-background flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white dark:bg-background flex items-center justify-center pt-2 ">
      {/* Main Container - Centered with proper gap */}
      <div className="flex items-center justify-center w-[95%] h-[88vh]  gap-4 px-6 pb-2 ">
        {/* Left side - Sermon List (50%) */}
        <div className="w-1/2 h-full flex flex-col relative   rounded-3xl bg-white dark:bg-primary/20">
          {/* Background Image */}
          {/* <di className="absolute inset-0 rounded-[20px] overflow-hidden">
            {/* <div
              className="absolute inset-0  "
              style={{
                backgroundImage: `url('./cloud.png')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
              }}
            /> */}

          <div className="backdrop-blur-md bg-white dark:bg-primary/70 p-4 relative z-10 flex flex-col h-full rounded-3xl dark:shadow-[#543915] shadow">
            {/* Fixed Header */}
            <div className="flex-shrink-0 py-4 border-b border-gray-200 dark:border-gray-700">
              {/* Search Input */}
              <div className="mb-4">
                <input
                  placeholder="Search sermons"
                  onChange={handleSearch}
                  className="w-[90%] p-3 text-sm bg-gray-50 dark:bg-primary border-none border-gray-300 dark:border-stone-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-[#42413f] text-stone-700 dark:text-white placeholder-gray-500"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="text-center py-8">
                  <span className="text-stone-700 dark:text-gray-300">
                    Loading sermons...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <span className="text-red-600 dark:text-red-400">
                    Error loading sermons
                  </span>
                </div>
              ) : (
                <div className="h-full flex flex-col font-zilla backdrop-blur-sm rounded-lg border border-stone-200 dark:border-amber-900/30">
                  {/* Fixed Table Header */}
                  <div className="flex-shrink-0">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-amber-950/50 dark:to-stone-900/80">
                        <tr className="border-b border-stone-200 dark:border-amber-900/40">
                          <th
                            className="text-left px-3 py-2.5 cursor-pointer group transition-all duration-200 hover:bg-stone-100 dark:hover:bg-amber-950/30 text-stone-700 dark:text-orange-200 font-medium text-sm font-zilla select-none"
                            onClick={() => handleSort("title")}
                          >
                            <div className="flex items-center gap-2">
                              <span className="group-hover:text-amber-600 dark:group-hover:text-orange-300 transition-colors">
                                Title
                              </span>
                              {sortField === "title" && (
                                <span className="text-amber-600 dark:text-orange-400 font-bold text-sm">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            className="text-left px-3 py-2.5 cursor-pointer group transition-all duration-200 hover:bg-stone-100 dark:hover:bg-amber-950/30 text-stone-700 dark:text-amber-200 font-medium text-sm font-zilla w-20 select-none"
                            onClick={() => handleSort("year")}
                          >
                            <div className="flex items-center gap-2">
                              <span className="group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                                Year
                              </span>
                              {sortField === "year" && (
                                <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
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
                        {sortedSermons.map((sermon, index) => (
                          <tr
                            key={sermon.id}
                            className="cursor-pointer group transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-stone-50/80 dark:hover:from-amber-950/20 dark:hover:to-stone-900/20 hover:shadow-sm"
                            onClick={() => handleSermonClick(sermon)}
                          >
                            <td className="px-3  text-stone-800 dark:text-text group-hover:text-amber-700 dark:group-hover:text-text/60 transition-colors text-sm leading-tight font-zilla border-x-0 border-t-0 border-b border-solid border-stone-100 dark:border-text/20">
                              <div className="flex items-center gap-2">
                                <span className="font-medium line-clamp-2 overflow-hidden">
                                  {sermon.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-3  text-stone-600 dark:text-amber-200 font-medium text-sm font-zilla w-20">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-stone-700 dark:text-text font-thin text-sm">
                                {sermon.year || "N/A"}
                              </span>
                            </td>
                            <td className="px-3  text-center w-16">
                              <div className="flex justify-center">
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
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Advanced Search (50%) */}
        <div className="w-1/2 h-full rounded-s mt-">
          <Search />
        </div>
      </div>
    </div>
  );
});

export default SermonList;
