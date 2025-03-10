import { useEffect, useMemo, useState, useContext } from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const { randomSermons, setSelectedMessage, setActiveTab, setCB } =
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#faeed1] rounded-tl-3xl ">
      {/* Background Image Layer */}
      {images.map((img, index) => (
        <div
          key={img}
          className="absolute inset-0 bg-cover bg-center"
          // initial={{ opacity: 0 }}
          // animate={{ opacity: index === currentImageIndex ? 0.4 : 0 }}
          // transition={{ duration: 1.5 }}
          // style={{ backgroundImage: `url(${img || "./pic3.jpg"})` }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-20 min-h-scr">
        <main className=" mx-auto px-4 py-6 lg:py-8">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
            {/* <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-3/5 space-y-4"
            >
              <h1 className="text-4xl lg:text-4xl font-bold text-white leading-tight">
                Revelation <span className="text-white">10:1-3</span>
              </h1>
              <p className="text-lg lg:text-md text-gray-300 font  leading-relaxed font-serif">
                And I saw another mighty angel come down from heaven, clothed
                with a cloud: and a rainbow was upon his head, and his face was
                as it were the sun, and his feet as pillars of fire...
              </p>
            </motion.div> */}
          </div>

          {/* Sermons Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-3xl lg:text-2xl font-bold text-[#9a674a] mb-6 font-serif">
              Robert Lambert Lee Preachings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-serif">
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
                    className="group relative shadow-inner bg-white/5 backdrop-blur-lg rounded-2xl hover:cursor-pointer overflow-hidden"
                    onClick={() => {
                      setSelectedMessage(sermon);
                      setActiveTab("message");
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#9a674a]/10 to-[#9a674a]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="p-5 relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full overflow-hidden border-2 bg-[#9a674a]">
                          <img
                            src="./cloud.png"
                            alt=""
                            className=" h-[5vh] w-[5vh] object-cover mix-blend-color-dodge shadow hue-rotate-180"
                            color="red"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-[#9a674a]  transition-colors duration-300">
                          {sermon?.title.slice(0, 30)}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-[#9a674a] text-sm">
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
                        <div className="flex items-center text-[#9a674a] text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 "
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
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
};

export default Home;
