import { useEffect, useMemo, useState } from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/Provider/Theme";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const { randomSermons, setSelectedMessage, setActiveTab, setCB } =
    useSermonContext();
  const { isDarkMode } = useTheme();
  const [hoveredSermon, setHoveredSermon] = useState<string | number | null>(
    null
  );

  const scriptures = useMemo(
    () => [
      {
        verse:
          "But in the days of the voice of the seventh angel, when he shall begin to sound, the mystery of God should be finished, as he hath declared to his servants the prophets.",
        reference: "Revelation 10:7",
      },
      {
        verse:
          "And I saw another mighty angel come down from heaven, clothed with a cloud: and a rainbow was upon his head, and his face was as it were the sun, and his feet as pillars of fire",
        reference: "Revelation 10:1",
      },
      {
        verse:
          "Wherefore we labour, that, whether present or absent, we may be accepted of him.",
        reference: "II Corinthians 5:9",
      },
      {
        verse:
          "Seeing ye have purified your souls in obeying the truth through the Spirit unto unfeigned love of the brethren, see that ye love one another with a pure heart fervently",
        reference: "I Peter 1:22",
      },
      {
        verse:
          "For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us",
        reference: "Romans 8:18",
      },
      {
        verse:
          "Let us hear the conclusion of the whole matter: Fear God, and keep his commandments: for this is the whole duty of man.",
        reference: "Ecclesiastes 12:13",
      },
    ],
    []
  );

  const images = useMemo(
    () => ["./led.jpg", "./pic3.jpg", "./pi8.jpg", "./pic5.jpg"],
    []
  );

  useEffect(() => {
    const switchImage = () => {
      const newIndex = Math.floor(Math.random() * images.length);
      setCurrentImageIndex(newIndex);
    };

    const switchScripture = () => {
      setCurrentScriptureIndex((prev) =>
        prev === scriptures.length - 1 ? 0 : prev + 1
      );
    };

    setCB(currentImageIndex);
    const imageInterval = setInterval(switchImage, 20000);
    const scriptureInterval = setInterval(switchScripture, 10000);

    return () => {
      clearInterval(imageInterval);
      clearInterval(scriptureInterval);
    };
  }, [currentImageIndex, images, setCB, scriptures.length]);

  const currentScripture = scriptures[currentScriptureIndex];

  return (
    <div
      className="h-screen relative overflow-auto no-scrollbar w-full bg-gray-50 dark:bg-ltgray rounded-tl-3xl"
      style={{
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundImage: !isDarkMode
          ? `linear-gradient(to bottom,
             rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 5) 20%),
              url("./wood7.png")`
          : `linear-gradient(to bottom,
             rgba(8, 8, 8, 0) 0%,
        rgba(0, 0, 0, 5) 20%),
              url("./snow2.jpg")`,
      }}
    >
      {/* Main Content */}
      <div className="relative z-10 h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
          {/* Header Section with Profile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/30">
                <img
                  src="./bob.jpg"
                  alt="Robert Lambert Lee"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-stone-500 dark:text-gray-50 font-serif">
                  Robert Lambert Lee
                </h1>
                <p className="text-stone-500 dark:text-gray-300 font-serif italic">
                  Preachings & Teachings
                </p>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="h-px w-32 bg-white/30"></div>
            </div>
          </motion.div>

          {/* Scripture Timeline Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12 w-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScriptureIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="relative backdrop-blur-sm py- px-8 rounded-lg border-l-4 border-white/30 bg-white/5 dark:bg-ltgray/20"
              >
                <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-white/50 to-white/10"></div>
                <p className="italic text-stone-500 dark:text-gray-50 text-lg md:text-xl font-serif leading-relaxed mb-3">
                  &ldquo;{currentScripture.verse}&rdquo;
                </p>
                <p className="text-stone-500 dark:text-gray-50 font-semibold font-serif text-right">
                  {currentScripture.reference}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Main Content Area - Timeline Style Sermons List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-grow pb-4"
          >
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/50 via-white/30 to-transparent"></div>

              <div className="space-y-2">
                {randomSermons.map((sermon, index) => (
                  <motion.div
                    key={sermon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative"
                    onMouseEnter={() => setHoveredSermon(sermon.id)}
                    onMouseLeave={() => setHoveredSermon(null)}
                    onClick={() => {
                      setSelectedMessage(sermon);
                      setActiveTab("message");
                    }}
                  >
                    <div className={`flex flex-col md:flex-row `}>
                      {/* Timeline Node */}
                      <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full bg-stone-200 dark:bg-white/30 border-2 border-stone-500 dark:border-white/50"></div>

                      {/* Content */}
                      <div className={`ml-6 md:ml-0 md:w-1/2  relative`}>
                        <div
                          className={`
                            p-6 rounded-lg backdrop-blur-sm cursor-pointer
                            border border-stone-200 dark:border-white/10 
                            hover:border-white/30
                            transition-all duration-300
                            bg-white/5 dark:bg-ltgray/10
                            ${
                              hoveredSermon === sermon.id
                                ? "shadow-lg bg-white/10 dark:bg-ltgray/20"
                                : ""
                            }
                          `}
                        >
                          <h3 className="font-serif text-lg font-semibold text-stone-500 dark:text-gray-50 mb-3">
                            {sermon?.title}
                          </h3>

                          <div className="flex items-center justify-between text-stone-500 dark:text-gray-300 text-sm font-serif">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {sermon.location || "N/A"}
                            </div>

                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {sermon.year}
                            </div>
                          </div>

                          {/* Reveal animation line */}
                          <div
                            className={`
                              absolute bottom-0 left-0 right-0 h-0.5 
                              bg-gradient-to-r from-gray-100 dark:from-transparent via-gray-500 dark:via-white/70 to-transparent
                              transform scale-x-0 
                              ${
                                hoveredSermon === sermon.id ? "scale-x-100" : ""
                              }
                              transition-transform duration-500
                            `}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
