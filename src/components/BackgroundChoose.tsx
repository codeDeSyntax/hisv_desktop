import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { useBmusicContext } from "@/Provider/Bmusic";
import TitleBar from "./TitleBar";

// Background data with sample presentation text
const backgroundData = [
  {
    id: 1,
    image: "./snow1.jpg",
    title: "Business Insights",
    subtitle: "Driving Growth Through Innovation",
    textColor: "text-gray-800",
  },
  {
    id: 2,
    image: "./snow2.jpg",
    title: "Tech Horizons",
    subtitle: "Exploring Future Technologies",
    textColor: "text-white",
  },
  {
    id: 3,
    image: "./pic3.jpg",
    title: "Creative Solutions",
    subtitle: "Transforming Ideas into Reality",
    textColor: "text-gray-900",
  },
  {
    id: 4,
    image: "./pi8.jpg",
    title: "Global Strategies",
    subtitle: "Connecting Worlds, Creating Opportunities",
    textColor: "text-white",
  },
  {
    id: 5,
    image: "./blue.jpg",
    title: "Innovative Thinking",
    subtitle: "Breaking Boundaries, Creating Future",
    textColor: "text-white",
  },
  {
    id: 6,
    image: "./wood2.jpg",
    title: "Collaborative Vision",
    subtitle: "Uniting Ideas, Inspiring Change",
    textColor: "text-white",
  },
  {
    id: 7,
    image: "./wood9.png",
    title: "Collaborative Vision",
    subtitle: "Uniting Ideas, Inspiring Change",
    textColor: "text-white",
  },
  {
    id: 8,
    image: "./wood7.png",
    title: "Collaborative Vision",
    subtitle: "Uniting Ideas, Inspiring Change",
    textColor: "text-white",
  },
  {
    id: 9,
    image: "./pic2.jpg",
    title: "Collaborative Vision",
    subtitle: "Uniting Ideas, Inspiring Change",
    textColor: "text-white",
  },
];

const PresentationBackgroundSelector: React.FC = () => {
  const [selectedBackground, setSelectedBackground] = useState("");
  const [direction, setDirection] = useState(0);
  const { setCurrentScreen, selectedSong } = useBmusicContext();

  const handleBackgroundSelect = (image: string) => {
    setDirection(selectedBackground !== null ? 1 : -1);
    setSelectedBackground(image);
  };

  useEffect(() => {
    const bg = localStorage.getItem("bmusicpresentationbg");
    if (bg) {
      setSelectedBackground(bg); // Fetch the background on mount
    }
  }, []); // Empty dependency array to ensure this runs only once

  useEffect(() => {
    if (selectedBackground) {
      localStorage.setItem("bmusicpresentationbg", selectedBackground); // Update storage when background changes
    }
  }, [selectedBackground]); // Only update when selectedBackground change

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

  const selectedBg = backgroundData.find(
    (bg) => bg.image === selectedBackground
  );

  return (
    <div className="bg-[#faeed1] h-screen flex flex-col justify-center items-center p-">
      <TitleBar />
      <div className="container mx-auto max-w-6xl">
        <ArrowLeftCircle
          className="size-6 text-[#a28686] hover:cursor-pointer hover:scale-105 ml-6"
          onClick={() => setCurrentScreen("Songs")}
        />
        <span title="present" className={`${selectedSong ? "" : "hidden"}`}>
          <Monitor
            className="size-6 text-[#a28686] hover:cursor-pointer hover:scale-105 ml-6"
            onClick={() => {
              window.api.projectSong(selectedSong);
              window.api.onDisplaySong((selectedSong) => {
                // handle songData
                alert(`songData: ${selectedSong.title}`);
              });
            }}
          />
        </span>
        <h2 className="text-2xl md:text-3x font-serif italic skew-x-12 font-bold text-center mb-8 text-gray-800">
          Select Presentation Background
        </h2>

        <div className="flex items-center space-x-4 px-6">
          {/* Main Selected Background */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={selectedBackground}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-800 to-purple-900"
            >
              <img
                src={selectedBg?.image}
                alt={`Selected Background ${selectedBackground}`}
                className="w-full h-[500px] object-cover"
              />
              <div
                className={`
                  absolute inset-0 bg-black/40 flex flex-col 
                  justify-center items-center text-center p-8
                
                `}
              >
                <motion.h3
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl  font-bold mb-4 text-white font-serif italic"
                >
                  {selectedSong?.title || "Amazing Grace"}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white font-bold"
                >
                  {/* dangerously rendered html */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedSong?.content || "",
                    }}
                  />
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Background Thumbnails */}
          <div className="w-64 flex flex-col space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar max-h-[500px] scrollbar-hide">
            {backgroundData.map((bg) => (
              <motion.div
                key={bg.id}
                className={`
                  relative cursor-pointer rounded-xl overflow-hidden 
                  border-4 transition-all duration-300
                  ${
                    selectedBackground === bg.image
                      ? "border-gray-800 scale-105"
                      : "border-transparent hover:border-gray-400 "
                  }
                `}
                whileHover={{ scale: 1.05 }}
                // whileTap={{ scale: 0.95 }}
                onClick={() => handleBackgroundSelect(bg.image)}
              >
                <img
                  src={bg.image}
                  alt={`Background ${bg.id}`}
                  className="w-full h-24 object-cover"
                />

                {selectedBackground === bg.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute h-6 w-6 flex items-center justify-center top-2 right-2 bg-gray-800 text-white 
                               p-1 rounded-full"
                  >
                    <Check size={16} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationBackgroundSelector;
