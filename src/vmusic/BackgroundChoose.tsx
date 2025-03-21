import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftCircle,
  Check,
  Folder,
  Loader2,
  Monitor,
  Image as ImageIcon,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useBmusicContext } from "@/Provider/Bmusic";
import TitleBar from "../shared/TitleBar";
import { useEastVoiceContext } from "@/Provider/EastVoice";

// App built-in background data
const builtInBackgrounds = [
  {
    id: 1,
    image: "./snow1.jpg",
    category: "Nature",
  },
  {
    id: 2,
    image: "./snow2.jpg",
    category: "Nature",
  },
  {
    id: 3,
    image: "./pic3.jpg",
    category: "Abstract",
  },

  {
    id: 5,
    image: "./blue.jpg",
    category: "Solid",
  },
  {
    id: 6,
    image: "./wood2.jpg",
    category: "Textures",
  },
 
  {
    id: 8,
    image: "./wood7.png",
    category: "Textures",
  },
  {
    id: 9,
    image: "./pic2.jpg",
    category: "Abstract",
  },
];

// Categories for organization
const categories = ["Nature", "Abstract", "Textures", "Solid", "Your Images"];

const PresentationBackgroundSelector: React.FC = () => {
  // State management
  const [selectedBackground, setSelectedBackground] = useState("");
  const [direction, setDirection] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [userImages, setUserImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sysImags, setSysImages] = useState<string[]>([]);

  // Context hooks
  const {  selectedSong } = useBmusicContext();
  const { setPresentationbgs,setAndSaveCurrentScreen } = useEastVoiceContext();

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load user images from cache/storage
  // const loadUserImagesFromCache = useCallback(() => {
  //   const cachedImages = localStorage.getItem("bmusicUserImages");
  //   if (cachedImages) {
  //     try {
  //       const parsedImages = JSON.parse(cachedImages);
  //       setUserImages(parsedImages);
  //       return true;
  //     } catch (e) {
  //       console.error("Failed to parse cached images", e);
  //       return false;
  //     }
  //   }
  //   return false;
  // }, []);

  // Fetch user images from selected directory
  const fetchUserImages = useCallback(async () => {
    setIsLoading(true);
    setImageError("");

    try {
      const imagesUrl = localStorage.getItem("vmusicimages");
      if (!imagesUrl) {
        setImageError("No image directory selected");
        setIsLoading(false);
        return;
      }

      const imageBase64List = await window.api.getImages(imagesUrl);
      // if(imageBase64List){
      //   setSysImages(imageBase64List);
      // }
      if (!imageBase64List || imageBase64List.length === 0) {
        setImageError("No images found in selected directory");
        setIsLoading(false);
        return;
      }

      // Cache the images in localStorage
      // localStorage.setItem("bmusicUserImages", JSON.stringify(imageBase64List));

      setUserImages(imageBase64List);
      setPresentationbgs(imageBase64List);
    } catch (error) {
      console.error("Error loading images:", error);
      setImageError("Failed to load images from directory");
    } finally {
      setIsLoading(false);
    }
  }, [setPresentationbgs]);

  // Initial load
  useEffect(() => {
    // Try to load from cache
    //  first
    // const cacheLoaded = loadUserImagesFromCache();
    fetchUserImages();
    // If nothing in cache, try to fetch
    // if (!cacheLoaded) {
    //   fetchUserImages();
    // }

    // Load selected background
    const savedBg = localStorage.getItem("bmusicpresentationbg");
    if (savedBg) {
      setSelectedBackground(savedBg);
    } else {
      // Default to first built-in background if nothing selected
      setSelectedBackground(builtInBackgrounds[0].image);
    }
  }, [fetchUserImages]);

  // Save selected background to localStorage
  useEffect(() => {
    if (selectedBackground) {
      localStorage.setItem("bmusicpresentationbg", selectedBackground);
    }
  }, [selectedBackground]);

  // Filter backgrounds by category
  const filteredBackgrounds = useMemo(() => {
    if (activeCategory === "All") {
      return builtInBackgrounds;
    } else if (activeCategory === "Your Images") {
      return [];
    } else {
      return builtInBackgrounds.filter((bg) => bg.category === activeCategory);
    }
  }, [activeCategory]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  // Handle background selection
  const handleBackgroundSelect = (image: string) => {
    setDirection(selectedBackground !== image ? 1 : -1);
    setSelectedBackground(image);
  };

  // Select folder for images
  const selectImageFolder = async () => {
    try {
      const folderPath = (await window.api.selectDirectory()) as unknown as
        | string
        | null;
      if (folderPath) {
        localStorage.setItem("vmusicimages", folderPath);
        await fetchUserImages();
        setActiveCategory("Your Images");
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
      setImageError("Failed to select directory");
    }
  };

  // Present the song with selected background
  const presentSong = () => {
    if (selectedSong) {
      window.api.projectSong(selectedSong);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-white to-white flex flex-col overflow-hidden font-serif">
      <TitleBar />

      {/* Main content */}
      <div className="flex-1  mx-auto max-w-7xl px-4 py-6 ">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAndSaveCurrentScreen("Songs")}
              className="flex items-center gap-2 px-2 text-[12px] py-2 rounded-lg bg-background shadow-inner text-primary hover:bg-slate-200 transition-colors"
            >
              <ArrowLeftCircle size={20} />
              <span className="hidden sm:inline">Back to Songs</span>
            </button>

            {selectedSong && (
              <button
                onClick={presentSong}
                className="flex items-center bg-primary gap-2 px-2 py-2 rounded-lg text-[12px] hover:bg-primary/60 text-white transition-colors"
                title="Present song"
              >
                <Monitor size={20} />
                <span className="hidden sm:inline">Present</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl  font-serif italic transform skew-x-12 font-bold text-center text-slate-800 dark:text-white">
            Presentation Backgrounds
          </h1>

          <button
            onClick={selectImageFolder}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background text-[12px] hover:bg-slate-300 text-primary  transition-colors"
          >
            <Folder size={20} />
            <span className="hidden sm:inline">Select Folder</span>
          </button>
        </div>

        {/* Category tabs */}
        <div className="mb-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700 pb-2">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-2 rounded-t-lg text-[12px] font-medium whitespace-nowrap transition-colors ${
                activeCategory === "All"
                  ? "bg-primary  text-background"
                  : "text-slate-600 bg-gray-50"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-t-lg text-[12px] font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-primary shadow text-background"
                    : "bg-gray-50  text-primary"
                }`}
              >
                {category === "Your Images" ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    {category}
                    {userImages.length > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full px-2">
                        {userImages.length}
                      </span>
                    )}
                  </div>
                ) : (
                  category
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div
          className={`grid ${
            isMobile ? "grid-cols-1" : "grid-cols-[1fr,300px]"
          } gap-6`}
        >
          {/* Preview area */}
          <div className=" rounded-2xl overflow-hidden shadow-xl h-[80%]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={selectedBackground}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="relative w-full h-[400px] md:h-[500px]"
              >
                <img
                  src={selectedBackground || "./wood7.png"}
                  alt="Preview Background"
                  className="w-full h-full object-cover"
                />

                {/* Preview overlay with sample text */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/30 backdrop-blur-sm p-6 rounded-xl max-w-2xl"
                  >
                    {selectedSong ? (
                      <>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white font-serif">
                          {selectedSong?.title || "Amazing Grace"}
                        </h3>
                        <div className="text-white text-[12px] py-6">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedSong?.content || "",
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-16 w-16 text-white mx-auto mb-4 opacity-75" />
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white font-serif">
                          Verse 1
                        </h3>
                        <p className="text-white text-lg">
                          Select a song to preview how it will look with this
                          background
                        </p>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnails area */}
          <div className="bg-background h-[80%] overflow-y-scroll no-scrollbar rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-primary">
                {activeCategory === "Your Images"
                  ? "Your Images"
                  : "App Backgrounds"}
              </h3>

              {activeCategory === "Your Images" && (
                <button
                  onClick={fetchUserImages}
                  className="text-background bg-primary"
                  title="Refresh images"
                  disabled={isLoading}
                >
                  <RefreshCw
                    size={20}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </button>
              )}
            </div>

            {/* Thumbnails grid */}
            <div className="overflow-y-auto max-h-[500px] no-scrollbar pr-2">
              {/* Error or empty state */}
              {((activeCategory === "Your Images" && userImages.length === 0) ||
                imageError) && (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 dark:text-slate-400">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin mb-4" />
                      <p>Loading your images...</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 mb-4" />
                      <p>{imageError || "No images found"}</p>
                      <button
                        onClick={selectImageFolder}
                        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        Select Image Folder
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Thumbnails grid */}
              <div className="grid grid-cols-2 gap-3">
                {activeCategory === "Your Images"
                  ? userImages.map((img, idx) => (
                      <BackgroundThumbnail
                        key={`user-${idx}`}
                        image={img}
                        isSelected={selectedBackground === img}
                        onSelect={() => handleBackgroundSelect(img)}
                      />
                    ))
                  : filteredBackgrounds.map((bg) => (
                      <BackgroundThumbnail
                        key={`builtin-${bg.id}`}
                        image={bg.image}
                        isSelected={selectedBackground === bg.image}
                        onSelect={() => handleBackgroundSelect(bg.image)}
                        label={bg.category}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Background thumbnail component
interface BackgroundThumbnailProps {
  image: string;
  isSelected: boolean;
  onSelect: () => void;
  label?: string;
}

const BackgroundThumbnail: React.FC<BackgroundThumbnailProps> = ({
  image,
  isSelected,
  onSelect,
  label,
}) => {
  return (
    <motion.div
      className={`
        relative cursor-pointer rounded-lg overflow-hidden 
        border-2 transition-all duration-300 group
        ${
          isSelected
            ? "border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700"
            : "border-transparent hover:border-slate-400 dark:hover:border-slate-600"
        }
      `}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div className="relative w-full h-20">
        <img
          src={image}
          alt="Background thumbnail"
          className="w-full h-full object-cover"
        />

        {/* Overlay & selection indicator */}
        <div
          className={`
          absolute inset-0 flex items-center justify-center
          transition-opacity duration-200
          ${isSelected ? "bg-black/20" : "bg-black/0 group-hover:bg-black/10"}
        `}
        >
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary text-white rounded-full p-1"
            >
              <Check size={16} className="text-background" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Optional label */}
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
          {label}
        </div>
      )}
    </motion.div>
  );
};

export default PresentationBackgroundSelector;
