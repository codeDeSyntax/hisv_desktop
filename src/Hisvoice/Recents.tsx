import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, MapPin, Calendar } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";

const Recents = () => {
  const {
    recentSermons,
    setSelectedMessage,
    setActiveTab,
    setRecentSermons,
    isCollapsed,
  } = useSermonContext();

  const handleDelete = (title: string) => {
    const updatedSermons = recentSermons.filter(
      (sermon) => sermon.title !== title
    );
    setRecentSermons(updatedSermons);
    localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
  };

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center overflow-y-scroll no-scrollbar font-serif"
      style={{
        backgroundImage: "url('./snow2.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white dark:via-ltgray dark:to-ltgray bg-opacity-50"></div>

      <div className="absolute inset-0 overflow-y-auto no-scrollbar scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <div className=" mx-auto px-4 py-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-6"
          >
            Recent Sermons
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`grid grid-cols-2  
                md:grid-cols-3 lg:grid-cols-4
            gap-6`}
          >
            <AnimatePresence>
              {recentSermons.map((sermon) => (
                <motion.div
                  key={sermon.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-ltgray bg-opacity-70 backdrop-filter backdrop rounded-xl shadow-lg px-6 py-3 transform transition duration-300 hover:bg-opacity-20 cursor-pointer relative group"
                  onClick={() => {
                    setSelectedMessage(sermon);
                    setActiveTab("message");
                  }}
                >
                  <div className="mb-4">
                    <div className="flex items-center ">
                      <img
                        src="./icon.png"
                        alt=""
                        className="h-10 w-10 mr-4 rounded-full shadow-md dark:shadow-black dark:bg-ltgray p-2"
                      />
                      <h3 className="text-sm font-semibold text-stone-500 truncate ">
                        {sermon.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-stone-500 dark:text-gray-300 text-[12px] flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {sermon.location || "N/A"}
                    </p>
                    <p className="text-stone-500 dark:text-gray-400 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {sermon.year}
                    </p>
                  </div>

                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sermon.title.toString());
                    }}
                  >
                    <Trash size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Recents;
