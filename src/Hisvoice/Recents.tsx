import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash,
  MapPin,
  Calendar,
  Receipt,
  BookCheck,
  BookA,
  BookDashed,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { AudioFilled, AudioTwoTone, BookTwoTone } from "@ant-design/icons";

const Recents = () => {
  const {
    recentSermons,
    setSelectedMessage,
    setActiveTab,
    setRecentSermons,
    isCollapsed,
  } = useSermonContext();

  const { isDarkMode } = useTheme();

  const handleDelete = (title: string) => {
    const updatedSermons = recentSermons.filter(
      (sermon) => sermon.title !== title
    );
    setRecentSermons(updatedSermons);
    localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
  };

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center overflow-y-scroll no-scrollbar font-serif dark:bg-background"
      style={
        {
          // backgroundImage: "url('./snow2.jpg')",
        }
      }
    >
      <div className="absolue inset-0 overflow-y-auto no-scrollbar scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <div className=" mx-auto px-4 py-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold font-zilla text-white mb-6"
          >
            Recent Sermons
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`grid grid-cols-1 sm:grid-cols-2  
                md:grid-cols-3 lg:grid-cols-4
            gap-6`}
          >
            <AnimatePresence>
              {recentSermons.map((sermon, index) => (
                <motion.div
                  key={sermon.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-primary shadow-2xl rounded-3xl transform transition duration-300 hover:scale-105 cursor-pointer relative group receipt-card"
                  onClick={() => {
                    setSelectedMessage(sermon);
                    setActiveTab("message");
                  }}
                  style={{
                    background: !isDarkMode
                      ? "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)"
                      : "linear-gradient(145deg, #292524  0%, #292524  100%)",
                    borderRadius: "2px",
                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  {/* Receipt Header */}
                  <div className="border-b-2 border-dashed bg-gray-200 dark:bg-background border-orange-200 dark:border-orange-200 pb-3 mb-3 px-4 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src="./icon.png"
                          alt=""
                          className="h-8 w-8 mr-3 rounded-full shadow-sm"
                        />
                        {sermon.type === "text" ? (
                          <BookDashed className="h-4 w-4 text-stone-400" />
                        ) : (
                          <AudioFilled
                            className="h-4 w-4 text-orange-400"
                            // color="#fb923c "
                          />
                        )}
                      </div>
                      <span className="text-xs font-zilla text-stone-400 bg-stone-100 dark:bg-primary px-2 py-1 rounded">
                        #{sermon.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-700 dark:text-stone-400 uppercase tracking-wide font-zilla leading-tight">
                      {sermon.title}
                    </h3>
                  </div>

                  {/* Receipt Body */}
                  <div className="px-4 pb-4 space-y-3">
                    {/* Location Row */}
                    <div className="flex justify-between items-center border-b border-dotted border-stone-200 dark:border-stone-500 pb-2">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-2 text-stone-500" />
                        <span className="text-xs font-zilla dark:text-orange-300 uppercase">
                          Location
                        </span>
                      </div>
                      <span className="text-xs font-zilla text-stone-700 dark:text-stone-400 font-semibold">
                        {sermon.location || "N/A"}
                      </span>
                    </div>

                    {/* Date Row */}
                    <div className="flex justify-between items-center border-b border-dotted border-stone-200 pb-2">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-stone-500" />
                        <span className="text-xs font-zilla dark:text-orange-300 uppercase">
                          Year
                        </span>
                      </div>
                      <span className="text-xs font-zilla text-stone-700 dark:text-stone-400 font-semibold">
                        {sermon.year}
                      </span>
                    </div>

                    {/* Receipt Footer */}
                    {/* <div className="border-t-2 border-dashed border-stone-300 pt-3 mt-4">
                      <div className="text-center">
                        <div className="text-xs font-zilla text-stone-500 mb-1">
                          ◆ ◆ ◆ SERMON RECEIPT ◆ ◆ ◆
                        </div>
                        <div className="text-xs font-zilla text-stone-400">
                          Thank you for your faith
                        </div>
                      </div>
                    </div> */}
                  </div>

                  {/* Perforated Edge Effect */}
                  <div
                    className="absolute -top-1 left-0 right-0 h-2 bg-white opacity-50"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #e5e7eb 8px, #e5e7eb 12px)",
                      clipPath:
                        "polygon(0 50%, 6px 0, 12px 50%, 18px 0, 24px 50%, 30px 0, 36px 50%, 42px 0, 48px 50%, 54px 0, 60px 50%, 66px 0, 72px 50%, 78px 0, 84px 50%, 90px 0, 96px 50%, 100% 0, 100% 100%, 0 100%)",
                    }}
                  ></div>

                  {/* Delete Button */}
                  <button
                    className="absolute -top-2 -right-2 bg-orange-950 dark:bg-primary text-white h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sermon.title.toString());
                    }}
                  >
                    <Trash size={14} />
                  </button>

                  {/* Receipt Paper Texture Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <style>{`
        .receipt-card {
          position: relative;
          font-family: 'Courier New', monospace;
        }
        
        .receipt-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0px,
            transparent 8px,
            rgba(0, 0, 0, 0.03) 8px,
            rgba(0,0,0,0.03) 9px,
            transparent 9px,
            transparent 17px,
            rgba(0,0,0,0.03) 17px,
            rgba(0,0,0,0.03) 18px
          );
          background-size: 18px 100%;
          pointer-events: none;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default Recents;
