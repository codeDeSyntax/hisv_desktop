import { useState, useContext, useRef } from "react";
import { Play, Download, ArrowLeft } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";

const DownloadSermon = () => {
  const { selectedMessage, setActiveTab } = useSermonContext();
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const downloadUrl =
    selectedMessage && selectedMessage.type === "mp3" && selectedMessage.downloadLink;
  const audioUrl = selectedMessage && selectedMessage.type === "mp3" && selectedMessage.audioUrl;

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
    setActiveTab("sermons"); // Assuming 'list' is the identifier for the sermon list tab
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  p-5">
      <div className="w-full max-w-lg">
        <button
          onClick={handleBack}
          className="flex items-center text-white mb-4 hover:text-gray-300"
        >
          <ArrowLeft size={24} />
          <span className="ml-2">Back to Sermon List</span>
        </button>

        <h1 className="text-white text-3xl mb-4">Sermon Audio</h1>
        <h2 className="text-gray-400 text-xl mb-8 text-center">
          {selectedMessage?.title}
        </h2>

        <button
          onClick={togglePlayPause}
          className="flex items-center justify-center bg-primary text-white text-lg py-4 px-6 rounded-full mb-6 w-full hover:bg-secondary disabled:opacity-50"
          disabled={!audioUrl}
        >
          {<Play size={32} />}
          <span className="ml-2">{"Play"}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center bg-primary text-white text-lg py-4 px-6 rounded-full mb-6 w-full hover:bg-secondary disabled:opacity-50"
          disabled={isLoading || !downloadUrl}
        >
          {isLoading ? (
            <div>Opening...</div>
          ) : (
            <>
              <Download size={32} />
              <span className="ml-2">Download</span>
            </>
          )}
        </button>

        {/* Audio Player */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} className="w-full" controls>
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};

export default DownloadSermon;
