import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  Suspense,
  lazy,
} from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/Provider/Theme";
import { SendHorizonal } from "lucide-react";

// Lazy load heavy components for better initial performance
const TypingVerse = lazy(() => import("@/components/TypingText"));
// Remove lazy loading for RandomSermonParagraph since it's needed immediately
import RandomSermonParagraph from "@/components/RandomParagraph";

const Home = memo(() => {
  const [currentScriptureIndex, setCurrentScriptureIndex] = useState(0);
  const { randomSermons, setSelectedMessage, setActiveTab, setCB } =
    useSermonContext();
  const { isDarkMode } = useTheme();
  const [hoveredSermon, setHoveredSermon] = useState<string | number | null>(
    null
  );

  // Memoize scriptures to prevent recreation on every render
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

  // Memoize current scripture to prevent unnecessary recalculations
  const currentScripture = useMemo(
    () => scriptures[currentScriptureIndex],
    [scriptures, currentScriptureIndex]
  );

  // Memoize sermon click handler to prevent recreation
  const handleSermonClick = useCallback(
    (sermon: any) => {
      setSelectedMessage(sermon);
      setActiveTab("message");
      setCB(1);
    },
    [setSelectedMessage, setActiveTab, setCB]
  );

  return (
    <div className="h-screen relative flex items-center overflow-auto no-scrollbar w-screen bg-white dark:bg-background ">
      {/* Main Content */}
      <div className="relative z-10 h-[85%] w-[95%] m-auto flex items-center justify-center gap-1 p-8">
        <div
          className=" mx-ato px-4 sm:px-6 lg:px-8 py-8  flex flex-col w-[45%] h-[90%] bg-gray-100 dark:bg-background  rounded-[20px]"
          style={{
            borderWidth: 6,
            borderColor: isDarkMode ? "#292524" : "#20202050",
            borderStyle: "dashed",
          }}
        >
          <div
            className="bg-white dark:bg-primary rounded-[20px]"
            // image background
            style={{
              backgroundImage: `${
                isDarkMode ? "url('./gradbg.png')" : "url('./wood11.jpg')"
              }`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* light blur over image */}
            {/* <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-[20px]"></div> */}

            {/* Header Section with Profile */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-12 bg-whi"
            >
              <div className="flex items-center space-x-4 px-6">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/30">
                  <img
                    src="./bob.jpg"
                    alt="Robert Lambert Lee"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1
                    className="text-2xl md:text-2xl font-bold font-cooper text-black truncate dark:text-gray-50 "
                    style={{}}
                  >
                    Robert Lambert Lee
                  </h1>
                  <p className="text-stone-500 dark:text-gray-300  italic">
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
              className="mb-12 w-full bg-white dark:bg-transparent"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScriptureIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5 }}
                  className=" backdrop-blur-sm px-8 py- rounded-lg border-l-4 border-white/30   flex flex-col justify-between"
                >
                  <div className=" top-0 left-0 h-full w-full bg-gradient-to-b from-white/50 to-white/10"></div>

                  <div className="  text-gray-50 font-zilla rounded-3xl italic ">
                    <Suspense
                      fallback={
                        <div className="h-16 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        </div>
                      }
                    >
                      <TypingVerse
                        verse={currentScripture.verse}
                        typingSpeed={40}
                        color={isDarkMode ? "#f2cdb4  " : ""}

                        // fontFamily="Palatino, serif"
                      />
                    </Suspense>
                  </div>

                  <p className="text-stone-500 dark:text-gray-300 font-semibold font-serif text-right mt-4">
                    {currentScripture.reference}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* <div className="flex items-center justify-center">
                <div
                  className="border-dashed rounded-full p-5 bg-gray-50 dark:bg-background border-gray-200 dark:border-gray-300"
                  style={{ borderWidth: 2 }}
                >
                  <SendHorizonal
                    className="size-24"
                    color={isDarkMode ? "#535252" : "#858585"}
                  />
                </div> */}
              {/* </div> */}
            </motion.div>
          </div>

          {/* Main Content Area - Timeline Style Sermons List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-grw pb-4"
          >
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/50 via-white/30 to-transparent"></div>
            </div>
          </motion.div>
        </div>

        <div
          className=" w-[45%] h-[90%]  bg-gray-100 dark:bg-background flex flex-col px-4 sm:px-6 lg:px-8 py-8 rounded-[20px]"
          style={{
            borderWidth: 6,
            borderColor: isDarkMode ? "#292524" : "#664138",
            borderStyle: "dashed",
          }}
        >
          <div className="  bg-white dark:bg-primary shadow-2xl rounded-3xl">
            {/* Receipt Header */}
            <div className="text-center py-6 px-6 border border-dashed border-gray-700 dark:border-text rounded-t-3xl">
              <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                SERMON ARCHIVE
              </h2>
              {/* <div className="text-xs font-mono text-gray-400 dark:text-gray-500">
                ID: {new Date().getTime().toString().slice(-6)}
              </div> */}
            </div>

            {/* Receipt Content */}
            <div className="px-6 py-4 ">
              <div className="space-y-1">
                {randomSermons.map((sermon, index) => (
                  <motion.div
                    key={sermon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredSermon(sermon.id)}
                    onMouseLeave={() => setHoveredSermon(null)}
                    onClick={() => handleSermonClick(sermon)}
                  >
                    {/* Item Line */}
                    <div className="py-3 border-b border-dottd bg-gray-50 dark:bg-background border-gray-600 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-stone-900 transition-colors duration-200 -mx-2 px-2 rounded-xl">
                      {/* Title Row */}
                      <div className="flex justify-between items-start mb-1">
                        {/* <img
                          src="./icon.png"
                          className="rounded-full h-10 w-10"
                        /> */}
                        <div className="flex-1 pr-2">
                          <div
                            className=" text-sm  text-black dark:text-[#f2cdb4] leading-tight font-zilla"
                            // style={{ fontFamily: "Palatino" }}
                          >
                            {sermon?.title}
                          </div>
                        </div>
                        <div className="font-mono text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                          {sermon.year}
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {sermon.location || "LOCATION N/A"}
                        </div>
                        <div className="font-mono text-gray-400 dark:text-gray-500">
                          #{String(index + 1).padStart(3, "0")}
                        </div>
                      </div>

                      {/* Hover Effect Bar */}
                      <div
                        className={`
                        mt-2 h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent
                        transform transition-all duration-300 origin-center
                        ${
                          hoveredSermon === sermon.id
                            ? "scale-x-100 opacity-100"
                            : "scale-x-0 opacity-0"
                        }
                      `}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {randomSermons.length > 0 && randomSermons[0] ? (
              <RandomSermonParagraph sermon={randomSermons[0] as any} />
            ) : (
              <div className="h-20 px-6 py-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Receipt Tear Line */}
            <div className="relative rounded-b-3xl">
              <div className="absolute inset-x-0 flex justify-center rounded-b-3xl">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              </div>
              <div className="flex justify-center space-x-1 py-2 bg-white dark:bg-primary rounded-b-3xl">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Home;
