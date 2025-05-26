import { useContext, useState, useMemo } from "react";
import { Tooltip, Space } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { LetterTextIcon, Mic } from "lucide-react";
import Search from "./Search.js";
import { useSermonContext } from "@/Provider/Vsermons.js";
import { Sermon } from "@/types/index.js";
import { useTheme } from "@/Provider/Theme.js";

const SermonList = () => {
  const {
    allSermons,
    loading,
    error,
    setActiveTab,
    setSelectedMessage,
    setRecentSermons,
  } = useSermonContext();

  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState("title");
  const [sortOrder, setSortOrder] = useState("ascend");
  const { isDarkMode } = useTheme();

  const filteredSermons = useMemo(() => {
    return allSermons.filter((sermon) =>
      sermon.title.toString().toLowerCase().includes(searchText.toLowerCase())
    );
  }, [allSermons, searchText]);

  const sortedSermons = useMemo(() => {
    return [...filteredSermons].sort((a, b) => {
      if (sortKey === "year") {
        const yearA = a.year;
        const yearB = b.year;
        return sortOrder === "ascend"
          ? Number(yearA) - Number(yearB)
          : Number(yearB) - Number(yearA);
      }
      return sortOrder === "ascend"
        ? (a[sortKey as keyof Sermon] as string).localeCompare(
            b[sortKey as keyof Sermon] as string
          )
        : (b[sortKey as keyof Sermon] as string).localeCompare(
            a[sortKey as keyof Sermon] as string
          );
    });
  }, [filteredSermons, sortKey, sortOrder]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSermonClick = (sermon: Sermon) => {
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
    localStorage.setItem("recentSermons", JSON.stringify(limitedRecentSermons));
    setRecentSermons(limitedRecentSermons);
  };

  const handleSort = (key: keyof Sermon) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortKey(key);
      setSortOrder("ascend");
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white dark:bg-background flex items-center justify-center">
        <div className="text-stone-700 dark:text-gray-50">
          Loading sermons...
        </div>
      </div>
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
      <div className="flex items-center justify-center w-[95%] h-[88vh]  gap-4 px-6 pb-2">
        {/* Left side - Sermon List (50%) */}
        <div className="w-1/2 h-full flex flex-col relative">
          {/* Background Image */}
          <div className="absolute inset-0 rounded-[20px] overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-indigo-200/20 dark:from-blue-800/10 dark:via-purple-800/10 dark:to-indigo-800/10 "
              style={{
                backgroundImage: `url('./cloud.png')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
              }}
            />
          </div>

          <div className="bg-gray-100/90 dark:bg-primary/50 backdrop-blur-md p-4 rounded-[20px] relative z-10 h-full flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 py-4 bg-  border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold font-serif mb-3 text-stone-700 dark:text-gray-50">
                Sermon List
              </h2>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  placeholder="Search sermons"
                  onChange={handleSearch}
                  className="w-[90%] p-3 text-sm bg-gray-50 dark:bg-primary border-none border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-gray-400 text-stone-700 dark:text-white placeholder-gray-500"
                  spellCheck={false}
                />
              </div>

              {/* Sort Buttons */}
              <div className="flex gap-2">
                <Tooltip title="Sort by Title" className="rounded-full">
                  <button
                    onClick={() => handleSort("title")}
                    className={`h-10 w-10 text-white transition-colors rounded-full border bg-transparent ${
                      sortKey === "title"
                        ? "border-black  dark:border-blue-500"
                        : "border-black  dark:border-white hover:bg-stone-500 dark:hover:bg-gray-600"
                    }`}
                    style={{
                      borderWidth: 1,
                      borderStyle: "dashed",
                    }}
                  >
                    <FontSizeOutlined className="mr-1 text-black dark:text-white" />
                    {sortKey === "title" &&
                      (sortOrder === "ascend" ? (
                        <SortAscendingOutlined className="mr-1 text-black dark:text-white" />
                      ) : (
                        <SortDescendingOutlined className="mr-1 text-black dark:text-white" />
                      ))}
                  </button>
                </Tooltip>

                <Tooltip title="Sort by Year">
                  <button
                    onClick={() => handleSort("year")}
                    className={`h-10 w-10 rounded-full text-white dark:text-black transition-colors bg-transparent ${
                      sortKey === "year"
                        ? "border-black  dark:border-blue-500"
                        : "border-black  dark:border-white hover:bg-stone-500 dark:hover:bg-gray-600"
                    }`}
                    style={{
                      borderWidth: 1,
                      borderStyle: "dashed",
                    }}
                  >
                    <CalendarOutlined className="mr-1 text-black dark:text-white" />
                    {sortKey === "year" &&
                      (sortOrder === "ascend" ? (
                        <SortAscendingOutlined className="mr-1 text-black dark:text-white" />
                      ) : (
                        <SortDescendingOutlined className="mr-1 text-black dark:text-white" />
                      ))}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {sortedSermons.length === 0 ? (
                <div className="flex items-center justify-center flex-col h-full">
                  <img
                    src="./nosong.png"
                    alt="No sermons"
                    className="h-40 mb-4"
                  />
                  <p className="text-stone-700 dark:text-gray-50">
                    No sermons found
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2 grid grid-cols-2 gap-2">
                  {sortedSermons.map((sermon) => (
                    <div
                      key={sermon.id}
                      className="border border-gray-300 dark:border-accent cursor-pointer px-3 py-2 backdrop-blur-sm  bg-transparent dark:bg-transparent  shadow hover:bg-white/90 dark:hover:backdrop-blur-md group rounded-lg transition-colors"
                      onClick={() => handleSermonClick(sermon)}
                      style={{ borderWidth: 2, borderStyle: "dashed" }}
                    >
                      <p className="text-sm font-bold font-zilla group-hover:underline text-background dark:text-orange-100 underline   mb-2">
                        {sermon.title}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center font-mono text-stone-600 dark:text-gray-300">
                          <CalendarOutlined className="mr-1" />
                          {sermon.year}
                        </span>

                        <span className="flex items-center font-mono text-stone-600 dark:text-gray-300">
                          <EnvironmentOutlined className="mr-1" />
                          {sermon.location || "N/A"}
                        </span>

                        <span className="flex items-center">
                          {sermon.type === "mp3" ? (
                            <Mic
                              size={12}
                              className="text-stone-600 dark:text-gray-400"
                            />
                          ) : (
                            <LetterTextIcon
                              size={12}
                              className="text-stone-600 dark:text-gray-400"
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
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
};

export default SermonList;
