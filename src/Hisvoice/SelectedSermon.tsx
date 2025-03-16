import React, {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { Card, Button } from "antd";
import DownloadSermon from "./PlayDownload";
import { ImageIcon, Search, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import SearchModal from "./SermonSearchModal";
import DarkModeToggle from "./ThemeSwitcher";
import { Sermon } from "@/types";
import { useSermonContext } from "@/Provider/Vsermons";

const SermonDetailsCard = ({ sermon }: { sermon: Sermon }) => {
  return (
    <Card
      className="absolute right-0 mr-14 mt-24 bg-primary text-white w-64 shadow-lg"
      bordered={false}
    >
      <h3 className="text-lg font-bold mb-2">{sermon?.title}</h3>
      <div className="text-sm space-y-2">
        <p>
          <span className="font-medium">Location:</span> {sermon?.location}
        </p>
        <p>
          <span className="font-medium">Year:</span> {sermon?.year || "N/A"}
        </p>
        <p>
          <span className="font-medium">Type:</span> {sermon?.type}
        </p>
      </div>
    </Card>
  );
};

const SaveNotification = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute z-30 bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Progress saved successfully! ✓
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SelectedSermon = ({
  background,
  setBackground,
}: {
  background: boolean;
  setBackground: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    selectedMessage,
    searchQuery,
    setSearchQuery,
    settings,
    setRecentSermons,
    theme,
  } = useSermonContext();

  const [showSearch, setShowSearch] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<number>(
    Number(selectedMessage?.lastRead) || 0
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLastReadCard, setShowLastReadCard] = useState(true);

  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showDetailsCard, setShowDetailsCard] = useState(false);

  const highlightEndnotes = (text: string) => {
    const endnoteRegex = /Endnote/gi;
    const parts = text.split(endnoteRegex);

    return (
      <span>
        {parts.map((part, i, arr) =>
          i < arr.length - 1 ? (
            <React.Fragment key={i}>
              {part}
              <span
                className="bg-yellow-500 text-black px-1 rounded"
                title="William branham qoute.🗝️🗝️ WMB qoute ends when you dont find the paragraph numbers anymore"
              >
                Endnote
              </span>
            </React.Fragment>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const highlightText = useCallback((text: string, highlight: string) => {
    if (!highlight?.trim()) return <span>{text}</span>;

    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part: string, i: number) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="text-background border border-green-600 rounded-md"
              style={{
                backgroundColor: "#9a674a",
                padding: "4px",
              }}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  }, []);

  useEffect(() => {
    if (searchQuery && scrollContainerRef.current) {
      const highlights = scrollContainerRef.current.querySelectorAll("mark");
      if (highlights.length > 0) {
        highlights[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    const timer = setTimeout(() => setSearchQuery(""), 60000);
    return () => clearTimeout(timer);
  }, [searchQuery, setSearchQuery]);

  // function to navigate to previous and next matches

  // Modified scroll handling logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition((container as HTMLElement).scrollTop);
    };

    (container as HTMLElement).addEventListener("scroll", handleScroll);
    return () =>
      (container as HTMLElement).removeEventListener("scroll", handleScroll);
  }, []);

  // Save scroll position when unmounting or changing sermons
  useEffect(() => {
    if (!selectedMessage?.id) return;

    const saveScrollPosition = () => {
      const recentSermons = JSON.parse(
        localStorage.getItem("recentSermons") || "[]"
      );
      const currentSermonIndex = recentSermons.findIndex(
        (sermon: Sermon) => sermon.id === selectedMessage.id
      );

      if (currentSermonIndex !== -1) {
        const updatedSermons = [...recentSermons];
        updatedSermons[currentSermonIndex] = {
          ...selectedMessage,
          lastRead: scrollPosition,
        };
        localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
        setRecentSermons(updatedSermons);
      }
    };

    // Save position when component unmounts or sermon changes
    return () => {
      saveScrollPosition();
    };
  }, [selectedMessage, scrollPosition, setRecentSermons]);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchQuery("");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowSearch(false);
  };

  const scrollToPosition = (height: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: height,
        behavior: "smooth",
      });
    }
  };

  const handleCloseLastReadCard = () => {
    setShowLastReadCard(false);
  };

  // Add manual save function
  const handleManualSave = () => {
    if (!selectedMessage?.id) return;

    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]"
    );
    const currentSermonIndex = recentSermons.findIndex(
      (sermon: Sermon) => sermon.id === selectedMessage.id
    );

    if (currentSermonIndex !== -1) {
      const updatedSermons = [...recentSermons];
      updatedSermons[currentSermonIndex] = {
        ...selectedMessage,
        lastRead: scrollPosition,
      };
      localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
      setRecentSermons(updatedSermons);
    }
    setShowSaveNotification(true);
  };

  const toggleDetailsCard = () => {
    setShowDetailsCard((prev) => !prev);
  };

  return (
    <div className=" bg-white dark:bg-ltgray h-screen overflow-hidden ">
      <SearchModal
        showSearch={showSearch}
        onClose={handleSearchToggle}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <SaveNotification
        show={showSaveNotification}
        onClose={() => setShowSaveNotification(false)}
      />
      <div className="  bg-center flex flex-col   pb-10">
        <div className=" mb-5 h-full">
          {selectedMessage?.type === "text" && (
            <div className=" flex items-center   gap-2 p-2 rounded-l-full mt-10 w-20">
              <div
                className="rounded-full h-4 w-4 hover:cursor-pointer hover:scale-125 duration-300  shadow  text-primary font-bold text-center flex items-center justify-center"
                title="Save progress"
                onClick={handleManualSave}
              >
                📝
              </div>
              <div
                className="rounded-full h-4 w-4 hover:cursor-pointer hover:scale-125 duration-300  shadow-lg  text-primary font-bold text-center flex items-center justify-center"
                title="Toggle sermon details"
                onClick={toggleDetailsCard}
              >
                <Info size={20} className="text-stone-500 dark:text-gray-50" />
              </div>

              <div
                className="rounded-full h-4 w-4 hover:cursor-pointer hover:scale-125 duration-300  shadow-lg dark:shadow-black  text-primary font-bold text-center flex items-center justify-center"
                title="Search in sermon"
                onClick={handleSearchToggle}
              >
                <Search className="text-stone-500 dark:text-gray-50" />
              </div>
              {/* <DarkModeToggle /> */}
            </div>
          )}

          {showDetailsCard && selectedMessage?.type === "text" && (
            <SermonDetailsCard sermon={selectedMessage} />
          )}

          <div
            className="rounded-lg p-4 h-[80vh] overflow-y-scroll overflow-x-hidden text-wrap"
            ref={scrollContainerRef}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor:
                theme === "light" ? "#c0c0c0 #f3f4f6" : "#424242 #202020",
              // scrollbarGutter: "stable",
            }}
          >
            {selectedMessage?.type === "text" ? (
              <div className="h-full">
                {selectedMessage?.lastRead && showLastReadCard && (
                  <Card
                    title="Welcome Back!"
                    bordered={false}
                    className="absolute right-0 mr-14 mb-4  text-text"
                    style={{ width: 300, textAlign: "center" }}
                    actions={[
                      <Button
                        type="text"
                        className="text-background bg-primary hover:bg-primary hover:scale-105"
                        onClick={() => {
                          scrollToPosition(scrollPosition);
                          setShowLastReadCard(false);
                        }}
                        key="continue"
                      >
                        Continue
                      </Button>,
                      <Button
                        type="primary"
                        onClick={handleCloseLastReadCard}
                        key="close"
                        className="text-white bg-primary hover:bg-primary hover:scale-105 hover:text-gray-300"
                      >
                        <X size={18} />
                      </Button>,
                    ]}
                  >
                    <p className="text-black">
                      You left off at this point in the sermon.
                    </p>
                  </Card>
                )}
                <p className=" text-2xl font-serif text-stone-500 dark:text-gray-50 font-bold underline">
                  {selectedMessage.title}
                </p>
                <p className=" font-serif italic text-stone-500 dark:text-gray-50 ">
                  {selectedMessage?.location}
                </p>
                {selectedMessage.sermon
                  ?.split("\n\n")
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-6 leading-relaxed text-stone-500 dark:text-gray-50 text-wrap text-left"
                      style={{
                        fontFamily: settings.fontFamily,
                        fontWeight: settings.fontWeight,
                        fontSize: `${settings.fontSize}px`,
                        fontStyle: settings.fontStyle,
                      }}
                    >
                      {searchQuery
                        ? highlightText(paragraph, searchQuery)
                        : highlightEndnotes(paragraph)}
                    </p>
                  ))}
              </div>
            ) : (
              <DownloadSermon />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SelectedSermon.propTypes = {
  background: PropTypes.bool.isRequired,
  setBackground: PropTypes.func.isRequired,
};

SearchModal.propTypes = {
  showSearch: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
};

SaveNotification.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

SermonDetailsCard.propTypes = {
  sermon: PropTypes.object.isRequired,
};

export default SelectedSermon;
