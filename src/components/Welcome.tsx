import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus, Minus, Square, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBmusicContext } from "@/Provider/Bmusic";

interface Song {
  title: string;
  path: string;
  content: string;
  message?: string; // Optional field from your original interface
  dateModified: string; // Optional field from your original interface
}

declare global {
  interface Window {
    api: {
      minimizeApp: () => void;
      maximizeApp: () => void;
      closeApp: () => void;
      selectDirectory: () => void;
      saveSong: (directory: string, title: string, content: string) => void;
      editSong: (directory: string, newTitle: string, content: string, originalPath: string) => void;
      searchSong:(directory:string,searchTerm:string) =>  Promise<Song[]>,
      fetchSongs : (directory:string) => Promise<Song[]>;
      deleteSong: (filePath: string) => void;
      onSongsLoaded: (callback: (songs: Song[]) => void) => void;
      getPresentationImages: (directory: string) => Promise<string[]>;
    };
  }
}


const WorkspaceSelector = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [currentBg, setCurrentBg] = useState<string>("./wood6.jpg");
  const [currentTiltedBg, setCurrentTiltedBg] = useState<string>("./wood6.jpg");
  const { currentScreen, setCurrentScreen} = useBmusicContext()

  // Auto background switching effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev === "./wood2.jpg" ? "./wood6.jpg" : "./wood2.jpg"));
      setCurrentTiltedBg((prev) => (prev === "./wood2.jpg" ? "./wood6.jpg" : "./wood2.jpg"));
    }, 60000); // Switch every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  // Determine colors based on the current background
  const hdColor = currentTiltedBg === "./wood2.jpg" ? "bg-[#0188a7]" : "bg-[#694a3f]";
  const hdButton = currentTiltedBg === "./wood2.jpg" ? "bg-[#1b9ebc]" : "bg-[#c77c5d]";

  return (
    <div
      className="w-screen h-full bg-cover bg-no-repeat flex p-6"
      style={{ backgroundImage: `url(${currentBg})` }}
    >
      <div className="w-1/2 mx-auto p-4 md:p-6 h-[86%] -rotate-12 border-4 border-red-500 rounded-full">
        {/* Animated Tilted Div Background */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentTiltedBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${currentTiltedBg})` }}
          />
        </AnimatePresence>

        {/* Header */}
        <div className="mb-4 relative z-10">
          <div className="flex items-center space-x-2 ml-2 -rotate-2">
            <div
              onClick={handleClose}
              onMouseEnter={() => setIsHovered("close")}
              onMouseLeave={() => setIsHovered(null)}
              className="w-4 h-4 rounded-full bg-[#FF5F57] hover:bg-red-600 hover:cursor-pointer flex items-center justify-center relative"
            >
              {isHovered === "close" && (
                <X className="absolute text-white w-3 h-3" />
              )}
            </div>
            <div
              onClick={handleMinimize}
              onMouseEnter={() => setIsHovered("minimize")}
              onMouseLeave={() => setIsHovered(null)}
              className="w-4 h-4 rounded-full bg-[#FFBD2E] hover:bg-yellow-600 hover:cursor-pointer flex items-center justify-center relative"
            >
              {isHovered === "minimize" && (
                <Minus className="absolute text-white w-3 h-3" />
              )}
            </div>
            <div
              onClick={handleMaximize}
              onMouseEnter={() => setIsHovered("maximize")}
              onMouseLeave={() => setIsHovered(null)}
              className="w-4 h-4 rounded-full bg-[#28CA41] hover:bg-green-600 hover:cursor-pointer flex items-center justify-center relative"
            >
              {isHovered === "maximize" && (
                <Square className="absolute text-white w-3 h-3" />
              )}
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4 text-white">
            Blessed Music
          </h2>
          <p className="text-white mt-1">
            Enjoy unperverted music with your soul
          </p>
        </div>

        {/* Workspace Item */}
        <div className="space-y-3 relative z-10">
          <div className={`flex items-center justify-between px-4 py-2 ${hdColor} border border-white rounded-lg duration-200`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${hdButton} rounded-lg flex items-center justify-center text-white font-semibold`}
              >
                AS
              </div>
              <div>
                <h3 className="font-medium text-white">All songs</h3>
                <p className="text-sm text-white">18 Songs</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentScreen("Songs")}
              className={`px-4 py-1.5 ${hdButton} text-white rounded-md hover:bg-gray-800 transition-colors duration-200`}
            >
              Go
            </button>
          </div>
        </div>

        {/* Add Song Button */}
        <button
        onClick={() => setCurrentScreen("create")}
          className={`mt-6 w-full p-4 flex items-center justify-center gap-2 border border-white bg-transparent rounded-lg hover:bg-[#c77c5d] transition-colors duration-200 text-white relative z-10`}
        >
          <Plus size={20} />
          Add a song
        </button>

        {/* Testimonial */}
        <div className="mt-6 px-6 py-3 rounded-lg text-white relative z-10">
          <p className="text-2xl leading-relaxed wqoute underline">
            "Let me listen to what kind of music you're playing on your radio.
            Let me see what kind of pictures you got in your house. I'll tell
            you what you're made out of."
          </p>
          <div className="flex justify-between items-center py-1">
            <p className="mt-4 font-medium">
              (56-0728 Making The Valley Full Of Ditches)
            </p>
            <img src="/swipebook.gif" className="size-10" alt="swipebook" />
          </div>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="rounded-full flex items-center justify-center mb-6 mx-auto">
            <img
              src="./grandp1.png"
              alt="Workspace illustration"
              className="w-64 h-64 object-cover rounded-full"
            />
            <img
              src={currentBg === "./wood2.jpg" ? "./wheat.png" : "./wheat1.png"}
              alt="Workspace illustration"
              className="w-40 h-40 object-cover rounded-full"
            />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Collaborate Seamlessly
          </h3>
          <p className="text-blue-100 text-sm max-w-xs mx-auto">
            Unlock the power of teamwork with Acme. Connect, create, and
            innovate together in one unified workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelector;