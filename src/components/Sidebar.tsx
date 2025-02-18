import {
  Music,
  Settings,
  History,
  Grid,
  List,
  Check,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { FolderOpen } from "lucide-react";
import { useBmusicContext } from "@/Provider/Bmusic";
interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const displayValue = selectedOption?.label || value;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-bold skew-x-12 italic mb-1 block">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 rounded-lg bg-[#9a674a]/20 text-[12px] border border-stone-200 flex items-center justify-between hover:bg-white/60 transition-colors"
      >
        <span>{displayValue as string}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-40 w-full mt-1 flex flex-col items-center  bg-[#9a674a] rounded-lg shadow-lg border border-stone-200 py-1 max-h-48 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-[90%] px-3 py-2 text-left  text-[12px] text-white hover:[#9a674a]/40 hover:text-black  transition-colors ${
                (option.value || option) === value
                  ? "bg-white/20 "
                  : "bg-[#9a674a]/20 text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const {
    songRepo,
    setSongRepo,
    selectedHymnBackground,
    setSelectedHymnBackground,
    presentationImgs,
  } = useBmusicContext();
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "16"
  );
  const [fontFamily, setFontFamily] = useState(
    localStorage.getItem("fontFamily") || "serif"
  );
  const [displayCount, setDisplayCount] = useState(
    localStorage.getItem("displayCount") || "6"
  );
  const [layout, setLayout] = useState(
    localStorage.getItem("layout") || "table"
  );
  const [selectedBg, setSelectedBg] = useState(
    localStorage.getItem("selectedBg") || "bg1"
  );

  const instruments = [
    { src: "./grandp2.png", alt: "Grand Piano 2" },
    { src: "./guitar.png", alt: "Guitar" },
    { src: "./trump.png", alt: "Trumpet" },
    { src: "./grandp1.png", alt: "Grand Piano 1" },
  ];

  const backgroundOptions = [
    {
      id: "bg1",
      name: "Classic Theme",
      thumbnail: "bg-[url(./wood6.jpg)]",
      gradient: "bg-gradient-to-r from-amber-50 to-amber-100",
    },
    {
      id: "bg2",
      name: "Midnight Jazz",
      thumbnail: "bg-[url(./wood2.jpg)]",
      gradient: "bg-gradient-to-r from-blue-900 to-purple-900",
    },
    {
      id: "bg3",
      name: "Sunset Vibes",
      thumbnail: "bg-[url(./wood3.jpg)]",
      gradient: "bg-gradient-to-r from-orange-200 to-rose-200",
    },
    {
      id: "bg4",
      name: "Forest Calm",
      thumbnail: "bg-[url(./wood5.jpg)]",
      gradient: "bg-gradient-to-r from-green-100 to-emerald-100",
    },
  ];
  const imgs = presentationImgs.map((img) => {});

  const fontSizeOptions = [
    { value: "text-3xl", label: "Small" },
    { value: "text-5xl", label: "Medium" },
    { value: "text-6xl", label: "Large" },
  ];

  const fontFamilyOptions = [
    { value: "serif", label: "Serif" },
    { value: "sans-serif", label: "Sans Serif" },
    { value: "monospace", label: "Monospace" },
  ];

  const displayCountOptions = [
    { value: "4", label: "4 Items" },
    { value: "6", label: "6 Items" },
    { value: "8", label: "8 Items" },
  ];

  const recentTracks = [
    {
      title: "Moonlight Sonata",
      artist: "Beethoven",
      lastPlayed: "2 hours ago",
    },
    { title: "Für Elise", artist: "Beethoven", lastPlayed: "Yesterday" },
    { title: "Symphony No. 5", artist: "Mozart", lastPlayed: "2 days ago" },
    { title: "The Four Seasons", artist: "Vivaldi", lastPlayed: "3 days ago" },
  ];

  const selectsongDir = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSongRepo(path);
      localStorage.setItem("bmusicsongdir", path);
    }
  };

  const selectPresentationBackground = (imagepath: string) => {
    setSelectedBg(imagepath);
    setSelectedHymnBackground(imagepath);
    localStorage.setItem("bmusicpresentationbg", imagepath);
  };

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("fontFamily", fontFamily);
    localStorage.setItem("displayCount", displayCount);
    localStorage.setItem("layout", layout);
    localStorage.setItem("selectedBg", selectedBg);
  }, [fontSize, fontFamily, displayCount, layout, selectedBg]);

  const renderContent = () => {
    switch (activeTab) {
      case "gallery":
        return (
          <div
            className={`${
              layout === "grid" ? "grid grid-cols-3 gap-2" : "space-y-2"
            }`}
          >
            {instruments
              .slice(0, Number(displayCount))
              .map((instrument, index) => (
                <div
                  key={index}
                  className={`${
                    layout === "grid"
                      ? "rounded-lg overflow-hidden"
                      : "flex items-center space-x-4 p-2 bg-white/30 rounded-lg"
                  }`}
                >
                  <img
                    src={instrument.src}
                    className={`${
                      layout === "grid" ? "w-20 h-20" : "w-16 h-16"
                    } rounded-lg shadow-lg border border-stone-200`}
                    alt={instrument.alt}
                  />
                  {layout === "list" && (
                    <span className="text-sm font-medium">
                      {instrument.alt}
                    </span>
                  )}
                </div>
              ))}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold skew-x-12 italic">
                Display Settings
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Background Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => selectPresentationBackground(bg.thumbnail)}
                      className={`relative group p-1 rounded-lg bg-[#9a674a]/30 border-2 transition-all ${
                        selectedBg === bg.id
                          ? "border-[#9a674a]"
                          : "border-transparent hover:border-stone-200"
                      }`}
                    >
                      <div
                        className={`${bg.thumbnail} bg-cover h-16 rounded-md overflow-hidden`}
                      >
                        {selectedBg === bg.thumbnail && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#9a674a] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs mt-1 block text-center">
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>
                {/* choose directory to load images from */}
                {/* <button
                  onClick={selectedImageDirectory}
                  className="w-full py-2 px-4  bg-white/50 border-2 border-[#9a674a]/20
                               hover:border-[#9a674a] text-[#9a674a] text-[12px] rounded-lg
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                >
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Images Directory</span>
                </button> */}
                <button
                  onClick={selectsongDir}
                  className="w-full py-2 px-4  bg-white/50 border-2 border-[#9a674a]/20
                               hover:border-[#9a674a] text-[#9a674a] text-[12px] rounded-lg
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                >
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Songs directory </span>
                </button>
              </div>

              <CustomDropdown
                label="Font Size"
                value={fontSize}
                onChange={setFontSize}
                options={fontSizeOptions}
              />

              <CustomDropdown
                label="Font Family"
                value={fontFamily}
                onChange={setFontFamily}
                options={fontFamilyOptions}
              />

              <CustomDropdown
                label="Items to Display"
                value={displayCount}
                onChange={setDisplayCount}
                options={displayCountOptions}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Layout Style</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setLayout("grid")}
                    className={`flex items-center space-x-2 p-2 rounded-lg ${
                      layout === "grid" ? "bg-stone-200" : "bg-white/50"
                    }`}
                  >
                    <Grid size={16} />
                    <span>Grid</span>
                  </button>
                  <button
                    onClick={() => setLayout("list")}
                    className={`flex items-center space-x-2 p-2 rounded-lg ${
                      layout === "list" ? "bg-stone-200" : "bg-white/50"
                    }`}
                  >
                    <List size={16} />
                    <span>List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "recent":
        return (
          <div className="space-y-2">
            {recentTracks.map((track, index) => (
              <div
                key={index}
                className="p-3 bg-white/30 rounded-lg backdrop-blur-sm transition-all hover:bg-white/40"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{track.title}</h4>
                    <p className="text-sm text-stone-600">{track.artist}</p>
                  </div>
                  <span className="text-xs text-stone-500">
                    {track.lastPlayed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      // style={{
      //   fontFamily: fontFamily,
      //   fontSize: `${fontSize}px`,
      // }}
      className="w-72 pt-10 border-r border-stone-300 bg-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar"
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-serif text-xl skew-x-12 italic font-thin text-[#9a674a] flex items-center gap-2">
          <Music className="w-5 h-5" />
          Soul healing music
        </h2>
      </div>

      <div className="px-4 mb-4">
        <div className="flex space-x-2 bg-[#faeed1] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-2 rounded-md text-[12px]  font-medium transition-colors ${
              activeTab === "gallery"
                ? "bg-[#9a674a] text-white"
                : "text-stone-600 bg-white"
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2 rounded-md text-[12px]  font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-[#9a674a] text-white"
                : "text-stone-600 bg-white"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-2 rounded-md text-[12px]  font-medium transition-colors ${
              activeTab === "recent"
                ? "bg-[#9a674a] text-white"
                : "text-stone-600 bg-white"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      <div className="p-4">{renderContent()}</div>
    </div>
  );
};

export default Sidebar;
