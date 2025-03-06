import React, { useEffect, useState } from "react";
import {
  Monitor,
  Search,
  List,
  Table,
  PlusIcon,
  TvIcon,
  X,
  RefreshCcw,
  Folder,
} from "lucide-react";
import TitleBar from "./TitleBar";
import { DeleteOutlined, EditOutlined, StarFilled } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import DeletePopup from "./DeletePopup";
import { useBmusicContext } from "@/Provider/Bmusic";
import { Song } from "@/types";

const BlessedMusic = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("collections");
  const [deleting, setDeleting] = useState(false);
  const [showDeleting, setShowDeleting] = useState(false);
  // const [fetchError, setFetchError] = useState("");
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("layout") || "table"
  );
  const {
    songRepo,
    setSongRepo,
    theme,
    setTheme,
    setCurrentScreen,
    selectedSong,
    setSelectedSong,
    fetching,
    favorites,
    fetchError,
    setFavorites,
    songs,
    setSongs,
    refetch,
  } = useBmusicContext();
  const [savedFavorites, setSavedFavorites] = useState<Song[]>(favorites);

  useEffect(() => {
    const savedDirectory = localStorage.getItem("bmusic");
    const savedTheme = localStorage.getItem("bmusic");
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedDirectory) {
      setSongRepo(savedDirectory);
      console.log("Saved directory:", savedDirectory);
    }
  }, []);

  const onSingleClick = (song: Song) => {
    setSelectedSong(song);
    setActiveTab("Song");
    localStorage.setItem("selectedSong", JSON.stringify(song));
  };

  const onDoubleClick = (song: Song) => {
    if (selectedSong) {
      setCurrentScreen("Presentation");
      localStorage.setItem("selectedSong", JSON.stringify(song));
    }
  };

  const presentSong = (selectedSong: any) => {
    if (selectedSong) {
      localStorage.setItem("selectedSong", JSON.stringify(selectedSong));
      window.api.projectSong(selectedSong);
      window.api.onDisplaySong((selectedSong) => {
        // handle songData
        alert(`songData: ${selectedSong.title}`);
      });
    }
  };

  // function to search for song directly from directory
  // const searchSong = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  //   try {
  //     setfetching(true);
  //     const searchedSongs: Song[] = await window.api.searchSong(
  //       songRepo,
  //       searchQuery
  //     );
  //     searchedSongs.sort((a, b) => {
  //       return a.title.localeCompare(b.title);
  //     });
  //     setSongs(searchedSongs);
  //     setFetchError("");
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       setFetchError(error.message);
  //     } else {
  //       setFetchError("An unknown error occurred");
  //     }
  //     console.error("Failed to search songs:", error);
  //     setSongs([]);
  //   } finally {
  //     setfetching(false);
  //   }
  // };

  const changeDirectory = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSongRepo(path);
      localStorage.setItem("bmusicsongdir", path);
    }
    const savedDirectory = localStorage.getItem("bmusicsongdir");
    if (savedDirectory) {
      setSongRepo(savedDirectory);
    }
  };

  const deleteSong = async (filePath: string) => {
    try {
      setDeleting(true);
      const response = await window.api.deleteSong(filePath);
      console.log("Delete song response:", response);
      setDeleting(false);
      setShowDeleting(false);
      refetch();
    } catch (error) {
      console.error("Failed to delete song:", error);
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split the filtered songs into two halves
  const midpoint = Math.ceil(filteredSongs.length / 2);
  const leftColumnSongs = filteredSongs.slice(0, midpoint);
  const rightColumnSongs = filteredSongs.slice(midpoint);

  const SongList = ({ songs }: { songs: Song[] }) => {
    if (viewMode === "table") {
      return (
        <div className="overflow-y-scroll  w-full no-scrollbar">
          <table className="w-full table-auto border-separate rounded-md ">
            <thead className="rounded-md">
              <tr className=" text-[#9a674a] rounded-md">
                <th className="px-4 py- text-left flex justify-between items-center">
                  <p>Title</p>
                  Modified
                </th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <tr
                  key={index}
                  className="border-b z-40 border-stone-200 shadow-inner flex items-center justify-between hover:bg-stone-100 transition-colors cursor-pointer"
                  style={{ borderWidth: "10px", borderColor: "#9a674a" }}
                  title={song.path}
                  onClick={() => onSingleClick(song)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDoubleClick(song);
                  }}
                >
                  <td className="px-4 py-2   flex items-center justify-center gap-2 text-stone-800 text-[12px] font-sans font-thin ">
                    <img src="./pdf.png" className="w-4 h-4" />
                    {song.title}
                  </td>
                  <td className="px-4 py-1 text-stone-800 text-[12px] font-serif">
                    {song.dateModified.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="space-y-4 w-full overflow-y-scroll no-scrollbar">
          <div className="flex items-center justify-between space-x-4 px-8 bod rounded-lg shadow-md hover:shadow-md transition-all duration-200 border border-stone-200 cursor-pointer">
            <p className="text-[13px] font-bold font-mono text-[#9a674a]">
              Title
            </p>
            <p className="text-[13px] font-bold font-mono text-[#9a674a]">
              {" "}
              Modified
            </p>
          </div>
          {songs.map((song, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-4  px-4 bod rounded-lg shadow-md hover:shadow-md  duration-200 border border-stone-200 cursor-pointer  hover:bg-stone-100 transition-colors "
              title={song.path}
              onClick={() => onSingleClick(song)}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDoubleClick(song);
              }}
            >
              <div className="flex items-center gap-5">
                {/* <BookText className="w-2 h-2 text-[#607274]" /> */}
                <img src="./pdf.png" className="w-4 h-4 pl-4" />
                <h3 className="text-[12px] text-stone-800 font-serif font-thin">
                  {song.title}
                </h3>
              </div>
              <p className="px-4 py-1 text-stone-800 text-[12px] text-right font-serif">
                {song.dateModified.slice(0, 10)}
              </p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-screen h-screen overflow-y-scroll no-scrollbar bg-[#faeed1] bg-cover">
      <TitleBar />
      {showDeleting && (
        <DeletePopup
          deleting={deleting}
          setDeleting={setDeleting}
          refetch={refetch}
          showDeleting={showDeleting}
          setShowDeleting={setShowDeleting}
          songPath={selectedSong?.path || ""}
          deleteSong={deleteSong}
        />
      )}
      <div
        className={`flex  h-screen no-scrollbar ${
          theme === "creamy" ? "gridb1" : "gridb"
        } `}
      >
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedFavorites={savedFavorites}
          setSavedFavorites={setSavedFavorites}
        />
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto h-full no-scrollbar">
          <div className="backdrop-blur-lg p-6 ">
            {/* Header with Search Bar and View Toggle */}
            <div className="flex flex-col justify-center mb-8 ">
              <div className="flex justify-between items-center space-x-4">
                <h1 className="font-serif text-2xl md:text-xl text-left font-bold text-[#9a674a]">
                  Blessed Songs of Zion
                  <span
                    className={`ml-4 text-[.7rem]  italic ${
                      selectedSong ? "" : "hidden"
                    }`}
                    style={{
                      color: `rgba(${Math.floor(
                        Math.random() * 255
                      )},${Math.floor(Math.random() * 255)},${Math.floor(
                        Math.random() * 255
                      )},1)`
                    }}
                  >
                    {"--" + selectedSong?.title.slice(0, 32) + "--"}
                  </span>
                </h1>

                <div
                  className={`flex flex-col justify-center items-center ${
                    selectedSong ? "flex" : "hidden"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span title="edit song">
                      <EditOutlined
                        className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                        onClick={() => {
                          // setSelectedSong(song)
                          setCurrentScreen("edit");
                        }}
                      />
                    </span>
                    <span title="Present here">
                      <TvIcon
                        className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                        onClick={() => setCurrentScreen("Presentation")}
                      />
                    </span>

                    <span title="Delete song">
                      <DeleteOutlined
                        className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                        onClick={() => setShowDeleting(true)}
                      />
                    </span>
                    <span title="deselect song">
                      <X
                        className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                        onClick={() => setSelectedSong(null)}
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search hymns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-white/40 rounded-lg border-none border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#9a674a] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-stone-500" />
                </div>

                {/* View Toggle Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1 px-2 rounded-lg ${
                      viewMode === "table"
                        ? "bg-[#9a674a] text-white"
                        : "bg-stone-100 text-stone-500"
                    } hover:bg-[#9a674a] hover:text-white transition-colors`}
                  >
                    <Table className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1 px-2 rounded-lg ${
                      viewMode === "list"
                        ? "bg-[#9a674a] text-white"
                        : "bg-stone-100 text-stone-500"
                    } hover:bg-[#9a674a] hover:text-white transition-colors`}
                  >
                    <List className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setCurrentScreen("create")}
                    className="p-1 px-2 rounded-lg bg-stone-100 text-stone-500 hover:bg-[#9a674a] hover:text-white transition-colors"
                    title="add song"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </button>
                  <button
                    // onClick={() => setCurrentScreen("Presentation")}
                    onClick={(e) => {
                      e.preventDefault();
                      presentSong(selectedSong);
                    }}
                    className={`p-1 px-2 rounded-lg bg-stone-100 text-stone-500 hover:bg-[#9a674a] hover:text-white transition-colors ${
                      selectedSong ? "block" : "hidden"
                    }`}
                    title="External screen"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={refetch}
                    className={`p-1 px-2 rounded-lg bg-stone-100 text-stone-500 hover:bg-[#9a674a] hover:text-white transition-colors`}
                    title="Reload"
                  >
                    <RefreshCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={changeDirectory}
                    className={`p-1 px-2 rounded-lg bg-stone-100 text-yellow-500 hover:bg-[#9a674a] hover:text-white transition-colors`}
                    title="change directory"
                  >
                    <Folder className="w-3 h-3" />
                  </button>
                  <button
                    // onClick={changeDirectory}
                    className={`p-1 px-2 rounded-lg font-thin text-[12px] bg-stone-100 text-stone-500 hover:bg-[#9a674a] hover:text-white transition-colors`}
                    title={songRepo}
                  >
                    📂{songRepo.slice(0, 13)}..
                  </button>
                </div>
              </div>
            </div>

            {/* Split View Content */}
            <div className="flex gap-6 w-full h-[80vh]">
              {fetching ? (
                <div className="flex flex-col justify-start items-center h-96 w-full">
                  <RefreshCcw className="w-10 h-10 text-[#9a674a] text-center animate-spin" />
                  <p className="mt-2 text-[14px] text-stone-500 font-medium">
                    fetching..
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={`font-thin flex flex-col justify-strt items-center text-[#9a674a] ${
                      songs.length === 0 ? "flex" : "hidden"
                    }  text-center absolute top-[30%] ml-[30%]`}
                  >
                    {" "}
                    {fetchError}
                    <img src="./look.svg" alt="lookerror" className="size-20" />
                  </div>
                  <SongList songs={leftColumnSongs} />
                  <SongList songs={rightColumnSongs} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlessedMusic;
