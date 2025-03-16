import { useEffect, useMemo, useState } from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const { randomSermons, setSelectedMessage, setActiveTab, setCB, theme } =
    useSermonContext();

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
      className="h-screen relative overflow-auto no-scrollbar w-full bg-gray-50 dark:bg-bgray   rounded-tl-3xl"
      style={{
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundImage:
          theme === "light"
            ? `linear-gradient(to bottom,
             rgba(154, 103, 74, 0) 0%,
        rgba(255, 255, 255, 5) 20%),
              url("./wood7.png")`
            : `linear-gradient(to bottom,
             rgba(154, 103, 74, 0) 0%,
        rgba(44,44, 44, 5) 20%),
              url("./snow2.jpg")`,
      }}
    >
      {/* Content Container */}
      <div className="relative z-10">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Sermons Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8"
          >
            <div className="flex items-center mb-8">
              <h2 className="text-2xl md:text-2xl font-bold text-stone-500 dark:text-gray-50 white mb-0 font-serif">
                Robert Lambert Lee Preachings
              </h2>
              <div className="h-px bg-white/30 flex-grow ml-6 hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 font-serif">
              <AnimatePresence>
                {randomSermons.map((sermon) => (
                  <motion.div
                    key={sermon.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.2 },
                    }}
                    className="group relative bg-gray-50 dark:bg-ltgray backdrop-blur-md rounded-2xl hover:cursor-pointer overflow-hidden border border-white/20 shadow-lg"
                    onClick={() => {
                      setSelectedMessage(sermon);
                      setActiveTab("message");
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b dark:from- to-[#9a674a]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="p-5 relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full overflow-hidden border-2 border-white/30">
                          <img
                            src="./icon.png"
                            alt=""
                            className="h-[5vh] w-[5vh] object-cover rounded-full  shadow hue-rotate-180"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-stone-500 dark:text-gray-50  transition-colors duration-300">
                          {sermon?.title.slice(0, 30)}
                          {sermon?.title.length > 30 && "..."}
                        </h3>
                      </div>

                      <div className="space-y-3 mt-4">
                        <div className="flex items-center text-stone-500 dark:text-gray-50  text-sm">
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
                        <div className="flex items-center text-stone-500 dark:text-gray-50 group-hover:text-white/90 text-sm">
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

                      {/* Accent line animation on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>

          <div className="flex items-center justify-start pt-4 ">
            {/* Scripture Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScriptureIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mb-12 p-6 mt-2 w-[50%] bg-white dark:bg-ltgray  backdrop-blur-sm rounded-lg border border-white/20 shadow-lg "
              >
                <p className="italic text-stone-500 dark:text-gray-50 text-lg md:text-xl font-serif leading-relaxed mb-3">
                  &ldquo;{currentScripture.verse}&rdquo;
                </p>
                <p className="text-stone-500 dark:text-gray-50 font-semibold font-serif text-right">
                  {currentScripture.reference}
                </p>
              </motion.div>
            </AnimatePresence>
            {/* Footer with changing image display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // transition={{ delay: 1, duration: 0.8 }}
              className=" text-center  w-[20%]"
            >
              {/* <AnimatePresence> */}
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // transition={{ duration: 1 }}
                className="inline-block w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 mb-4"
              >
                <img
                  src="./bob.jpg"
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* </AnimatePresence> */}
              <p className="text-stone-500  text-sm font-serif">
                Robert Lambert Lee
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
