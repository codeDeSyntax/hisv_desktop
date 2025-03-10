import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Info,
} from "lucide-react";
import TitleBar from "../shared/TitleBar";

// Define our instrument type
interface Instrument {
  id: number;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  audioSample?: string;
}

// Sample data
const instruments: Instrument[] = [
  {
    id: 1,
    name: "Brass Trumpet",
    type: "Brass",
    description: "A masterpiece of craftsmanship with rich, warm tone.",
    imageUrl: "./trump.png",
    audioSample: "violin-sample.mp3",
  },
  {
    id: 2,
    name: "Steinway & Sons Grand Piano",
    type: "Percussion",
    description: "Concert grand piano with unparalleled depth and resonance.",
    imageUrl: "./grandp1.png",
    audioSample: "piano-sample.mp3",
  },
  {
    id: 3,
    name: "Gibson Les Paul Custom",
    type: "Electric Guitar",
    description:
      "Legendary electric guitar with mahogany body and PAF-style humbuckers.",
    imageUrl: "./guitar.png",
    audioSample: "guitar-sample.mp3",
  },
  {
    id: 4,
    name: "Selmer Paris Reference 54 Saxophone",
    type: "Woodwind",
    description:
      "Professional saxophone with warm, vibrant tone and exceptional projection.",
    imageUrl: "./grandp2.png",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 5,
    name: "Vector Instrument set",
    type: "Woodwind",
    description: "All music set",
    imageUrl: "./inst2.png",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 6,
    name: "Music",
    type: "Brass",
    description: "All music set",
    imageUrl: "./grandp3.jpg",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 7,
    name: "Vector Instrument set",
    type: "Electric Guitar",
    description: "All music set",
    imageUrl: "./guitar2.png",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 8,
    name: "Vector Instrument set",
    type: "Electric Guitar",
    description: "All music set",
    imageUrl: "./guitar1.png",
    audioSample: "saxophone-sample.mp3",
  },
];

const InstrumentShowroom: React.FC = () => {
  // Duplicating the instruments array to create a seamless loop
  const duplicatedInstruments = [
    ...instruments,
    ...instruments,
    ...instruments,
  ];

  const [currentIndex, setCurrentIndex] = useState(instruments.length);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(20); // seconds for one complete cycle
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselControls = useAnimation();

  const currentInstrument = instruments[currentIndex % instruments.length];

  // Function to start the continuous animation
  const startContinuousScroll = () => {
    const containerWidth = containerRef.current?.scrollWidth || 0;

    carouselControls.start({
      x: [-containerWidth / 3, (-containerWidth * 2) / 3],
      transition: {
        x: {
          duration: autoScrollSpeed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      },
    });
  };

  // Start or pause the animation
  useEffect(() => {
    if (isPlaying) {
      startContinuousScroll();
    } else {
      carouselControls.stop();
    }
  }, [isPlaying, autoScrollSpeed]);

  // Ensure we update current index based on visible instruments
  useEffect(() => {
    if (isPlaying) {
      const indexInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % duplicatedInstruments.length);
      }, (autoScrollSpeed * 1000) / instruments.length);

      return () => clearInterval(indexInterval);
    }
  }, [isPlaying, autoScrollSpeed]);

  // Toggle slideshow play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Change speed
  const increaseSpeed = () => {
    setAutoScrollSpeed((prev) => Math.max(10, prev - 5));
  };

  const decreaseSpeed = () => {
    setAutoScrollSpeed((prev) => Math.min(40, prev + 5));
  };

  // Toggle audio play/pause
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // Toggle info display
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Reset audio when changing instruments
  useEffect(() => {
    setIsAudioPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#faeed1] to-[#f5e8c1] flex flex-col items-center justify-center relative overflow-hidden">
      <TitleBar />
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentInstrument.audioSample}
        onEnded={() => setIsAudioPlaying(false)}
      />

      {/* Main showcase area - carousel container */}
      <div
        ref={containerRef}
        className="w-full h-3/4 flex items-center justify-center overflow-hidden relative"
      >
        <motion.div
          className="flex items-center absolute"
          animate={carouselControls}
          initial={{ x: -(containerRef.current?.scrollWidth ?? 0) / 3 }}
        >
          {duplicatedInstruments.map((instrument, idx) => (
            <motion.div
              key={`${instrument.id}-${idx}`}
              className={`mx-6 relative flex-shrink-0 ${
                idx % instruments.length === currentIndex % instruments.length
                  ? "scale-110 z-10"
                  : "scale-90 opacity-70"
              } transition-all duration-1000`}
              whileHover={{
                scale: 1.15,
                opacity: 1,
                zIndex: 20,
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                className="relative group overflow-hidden rounded-2xl"
                whileHover={{ y: -10 }}
              >
                <motion.img
                  src={instrument.imageUrl}
                  alt={instrument.name}
                  className="h-64 w-64 object-contain p-4 rounded-2xl shadow-xl 
                            bg-gradient-to-b from-[#fbf5e6]/90 to-[#f0e4c3]/90 backdrop-blur-sm
                            group-hover:shadow-2xl transition-all duration-500"
                  whileHover={{
                    rotate: [0, -1, 1, 0],
                    filter: "brightness(1.1) contrast(1.05)",
                  }}
                />

                {/* Image shine effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 rounded-2xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{
                    opacity: [0, 0.2, 0],
                    x: ["-100%", "100%"],
                    transition: {
                      duration: 1.5,
                      ease: "easeInOut",
                    },
                  }}
                />

                {/* Subtle floating particles */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-[#f0e4c3]/40 pointer-events-none"
                    initial={{
                      x: Math.random() * 100 - 50,
                      y: Math.random() * 100 - 50,
                      opacity: 0,
                    }}
                    animate={{
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                      opacity: [0, 0.7, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ))}

                {/* Instrument name badge */}
                <motion.div
                  className="absolute -bottom-10 left-0 right-0 bg-[#e9dbb4]/80 backdrop-blur-sm 
                            px-3 py-2 rounded-b-2xl shadow-inner opacity-0 group-hover:opacity-100
                            group-hover:bottom-0 transition-all duration-300"
                >
                  <h3 className="text-sm font-bold text-[#8b7e66] truncate">
                    {instrument.name}
                  </h3>
                  <p className="text-[#a89b7e] text-xs">{instrument.type}</p>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Detailed information panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 30, height: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 
                      bg-[#f5e8c1]/90 backdrop-blur-md p-6 rounded-xl
                      max-w-md shadow-lg text-center border border-[#e9dbb4]"
          >
            <motion.h2
              className="text-2xl font-bold text-[#7d6e56] mb-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {currentInstrument.name}
            </motion.h2>
            <motion.div
              className="w-16 h-1 bg-[#a89b7e] mx-auto mb-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.2 }}
            />
            <motion.p
              className="text-[#8b7e66] text-sm mb-3 font-medium"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentInstrument.type}
            </motion.p>
            <motion.p
              className="text-[#a89b7e] leading-relaxed"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentInstrument.description}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation and controls */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                    flex items-center p-4 bg-[#f5e8c1]/80 backdrop-blur-md rounded-full
                    shadow-lg border border-[#e9dbb4] space-x-5"
      >
        {/* Info toggle button */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: [0, 10, -10, 0] }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleInfo}
          className={`p-3 rounded-full ${
            showInfo ? "bg-[#cebf95]" : "bg-[#e9dbb4]"
          } text-[#7d6e56] shadow-md flex items-center justify-center`}
        >
          <Info size={18} />
        </motion.button>

        {/* Speed controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={increaseSpeed}
            className="p-2 rounded-full bg-[#e9dbb4] hover:bg-[#d9c89e] text-[#7d6e56] shadow-sm"
          >
            <ChevronLeft size={16} />
            <ChevronLeft size={16} className="-ml-3" />
          </motion.button>

          {/* Play/Pause control */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="p-4 rounded-full bg-[#d9c89e] hover:bg-[#cebf95] text-[#7d6e56] shadow-md
                      flex items-center justify-center"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={decreaseSpeed}
            className="p-2 rounded-full bg-[#e9dbb4] hover:bg-[#d9c89e] text-[#7d6e56] shadow-sm"
          >
            <ChevronRight size={16} />
            <ChevronRight size={16} className="-ml-3" />
          </motion.button>
        </div>

        {/* Audio control */}
        {currentInstrument.audioSample && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isAudioPlaying ? "bg-[#cebf95]" : "bg-[#e9dbb4]"
            } text-[#7d6e56] shadow-md flex items-center justify-center`}
          >
            <Volume2 size={18} />
            {isAudioPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#7d6e56]"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            )}
          </motion.button>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-[#d9c89e]"
        initial={{ width: 0 }}
        animate={{
          width: isPlaying ? ["0%", "100%"] : "0%",
        }}
        transition={{
          duration: autoScrollSpeed / instruments.length,
          ease: "linear",
          repeat: isPlaying ? Infinity : 0,
          repeatType: "loop",
        }}
      />
    </div>
  );
};

export default InstrumentShowroom;
