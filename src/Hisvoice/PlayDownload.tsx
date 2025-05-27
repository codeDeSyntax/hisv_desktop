import { useState, useContext, useRef } from "react";
import { Play, Download, ArrowLeft } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

const DownloadSermon = () => {
  const { selectedMessage, setActiveTab } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const downloadUrl =
    selectedMessage &&
    selectedMessage.type === "mp3" &&
    selectedMessage.downloadLink;
  const audioUrl =
    selectedMessage &&
    selectedMessage.type === "mp3" &&
    selectedMessage.audioUrl;

  const togglePlayPause = () => {
    if (audioUrl) {
      setIsLoading(true);
      window.open(audioUrl, "_blank");
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      setIsLoading(true);
      window.open(audioUrl, "_blank");
      setIsLoading(false);
    } else {
      alert("Download link not available");
    }
  };

  const handleBack = () => {
    setActiveTab("sermons");
  };

  return (
    <div
      className={`h-[90vh] p-6 pt-12 font-cooper transition-colors duration-300 ${
        isDarkMode ? "bg-[#1c1917]" : "bg-stone-50"
      }`}
    >
      <div className="flex justify-center ">
        <div
          className={`w-full max-w-md relative  ${
            isDarkMode
              ? "bg-[#1c1917] border-[#292524] text-[#f5f5f4]"
              : "bg-white border-stone-200 text-stone-800"
          } border-2 shadow-2xl`}
        >
          {/* Receipt Header Pattern */}
          <div
            className={`h-3 ${
              isDarkMode ? "bg-[#292524]" : "bg-stone-100"
            } border-b-2 border-dashed ${
              isDarkMode ? "border-[#a8a29e]" : "border-stone-300"
            } relative overflow-hidden`}
          >
            <div className="absolute inset-0 flex">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-full ${
                    isDarkMode ? "bg-[#a8a29e]" : "bg-stone-200"
                  } ${i % 2 === 0 ? "opacity-30" : "opacity-10"}`}
                />
              ))}
            </div>
          </div>

          {/* Receipt Content */}
          <div className="px-6">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className={`flex items-center justify-center w-full p-3 mb-3 ${
                isDarkMode
                  ? "bg-[#292524] hover:bg-[#a8a29e] text-[#f5f5f4]"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              } border-2 ${
                isDarkMode ? "border-[#a8a29e]" : "border-stone-300"
              } border-dashed transition-all duration-300 hover:scale-105 font-bold uppercase tracking-wider text-sm`}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to List
            </button>

            {/* Receipt Title */}
            <div className="text-center mb-6">
              <div
                className={`border-b-2 border-dashed ${
                  isDarkMode ? "border-[#a8a29e]" : "border-stone-300"
                } pb-3 mb-2`}
              >
                <h1 className="text-xl font-bold uppercase tracking-widest">
                  Sermon Audio
                </h1>
              </div>
              <div
                className={`text-xs uppercase tracking-wider ${
                  isDarkMode ? "text-[#a8a29e]" : "text-stone-500"
                }`}
              >
                Download Receipt
              </div>
            </div>

            {/* Sermon Details */}
            <div
              className={`border-2 border-dashed ${
                isDarkMode ? "border-[#292524]" : "border-stone-200"
              } p-4 mb-6 ${isDarkMode ? "bg-[#292524]/20" : "bg-stone-50"}`}
            >
              <div className="text-center">
                <div
                  className={`text-xs uppercase tracking-wider mb-2 ${
                    isDarkMode ? "text-[#a8a29e]" : "text-stone-500"
                  }`}
                >
                  Item Description
                </div>
                <h2 className="text-lg font-bold break-words">
                  {selectedMessage?.title || "Untitled Sermon"}
                </h2>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-3  ">
              <button
                onClick={togglePlayPause}
                disabled={!audioUrl}
                className={`w-full flex items-center justify-center p-4 font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                  isDarkMode
                    ? "bg-[#292524] hover:bg-[#a8a29e] text-[#f5f5f4] border-[#a8a29e]"
                    : "bg-stone-700 hover:bg-stone-800 text-white border-stone-500"
                } border-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
              >
                <Play size={20} className="mr-3" />
                Play Audio
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading || !downloadUrl}
                className={`w-full flex items-center justify-center p-4 font-bold uppercase tracking-wider text-sm transition-all duration-300 border-2 border-dashed ${
                  isDarkMode
                    ? "bg-transparent hover:bg-[#292524] text-[#f5f5f4] border-[#a8a29e]"
                    : "bg-transparent hover:bg-stone-100 text-stone-700 border-stone-400"
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-3"></div>
                    Opening...
                  </>
                ) : (
                  <>
                    <Download size={20} className="mr-3" />
                    Download
                  </>
                )}
              </button>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div
                className={`border-2 border-dashed ${
                  isDarkMode ? "border-[#292524]" : "border-stone-200"
                } p-4 ${isDarkMode ? "bg-[#292524]/20" : "bg-stone-50"}`}
              >
                <div
                  className={`text-xs uppercase tracking-wider mb-3 text-center ${
                    isDarkMode ? "text-[#a8a29e]" : "text-stone-500"
                  }`}
                >
                  Audio Player
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  className="w-full"
                  controls
                  style={{
                    filter: isDarkMode
                      ? "invert(1) hue-rotate(180deg)"
                      : "none",
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Receipt Footer Pattern */}
            <div
              className={`mt-6 pt-4 border-t-2 border-dashed ${
                isDarkMode ? "border-[#a8a29e]" : "border-stone-300"
              }`}
            >
              <div
                className={`text-center text-xs uppercase tracking-widest ${
                  isDarkMode ? "text-[#a8a29e]" : "text-stone-400"
                }`}
              >
                Thank You
              </div>
            </div>
          </div>

          {/* Bottom Receipt Edge */}
          <div
            className={`h-4 ${
              isDarkMode ? "bg-[#292524]" : "bg-stone-100"
            } border-t-2 border-dashed ${
              isDarkMode ? "border-[#a8a29e]" : "border-stone-300"
            } relative overflow-hidden`}
          >
            <div className="absolute inset-0 flex">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-full ${
                    isDarkMode ? "bg-[#a8a29e]" : "bg-stone-200"
                  } ${i % 2 === 0 ? "opacity-30" : "opacity-10"}`}
                />
              ))}
            </div>
          </div>

          {/* Receipt Tear Effect */}
          <div
            className={`absolute -bottom-2 left-0 right-0 h-4 ${
              isDarkMode ? "bg-[#1c1917]" : "bg-stone-50"
            }`}
          >
            <div className="flex justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 ${
                    isDarkMode ? "bg-[#1c1917]" : "bg-stone-50"
                  } transform rotate-45 -mt-2`}
                  style={{ marginLeft: i === 0 ? 0 : "-8px" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadSermon;
