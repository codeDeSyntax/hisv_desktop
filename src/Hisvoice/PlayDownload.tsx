import { useState, useRef } from "react";
import { Play, Pause, Download, ArrowLeft, Globe, Music } from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";

const DownloadSermon = () => {
  const { selectedMessage, setActiveTab } = useSermonContext();
  const { isDarkMode } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showWebsite, setShowWebsite] = useState(true); // Default to web view
  const audioRef = useRef<HTMLAudioElement>(null);

  const downloadUrl =
    selectedMessage?.type === "mp3" && selectedMessage.downloadLink;
  const audioUrl = selectedMessage?.type === "mp3" && selectedMessage.audioUrl;
  const webUrl = selectedMessage?.downloadLink; // Using downloadLink as web URL

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100
    );
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime =
      (Number(e.target.value) / 100) * (audioRef.current.duration || 1);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(Number(e.target.value));
  };

  const handleDownload = () => {
    if (downloadUrl) {
      setIsLoading(true);
      window.open(downloadUrl, "_blank");
      setIsLoading(false);
    } else {
      alert("Download link not available");
    }
  };

  const handleBack = () => {
    setActiveTab("sermons");
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 dark:from-[#1c1917] dark:via-[#292016] dark:to-[#1f1e1a] flex items-center justify-center p-6"
      // image background
      style={{
        backgroundImage: `${isDarkMode ? "url('./gradbg.png')" : "url('./wood11.jpg')"} `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Back Button - Fixed Position */}
      <button
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-xl text-stone-600 dark:text-amber-200 hover:bg-white dark:hover:bg-[#1c1917] transition-all duration-200 shadow-lg border border-stone-200/50 dark:border-amber-900/20 text-sm"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Compact Audio Player Layout */}
      <div className="w-[30%] rounded-xl shadow-2xl border border-stone-200/50 dark:border-amber-900/20 p-4 max-w-4xl">
        {/* Audio URL Embed - Full Width */}
        <div className="mb-4">
          {audioUrl ? (
            <div className="w-full h-96 rounded-lg overflow-hidden border border-stone-300 dark:border-amber-800/40 shadow-sm relative">
              <div className="w-full h-full overflow-hidden">
                <iframe
                  src={audioUrl}
                  className="w-full border-none"
                  title="Audio Player"
                  sandbox="allow-scripts allow-same-origin"
                  style={{
                    height: "calc(100% + 17px)",
                    marginRight: "-17px",
                    border: "none",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-96 rounded-lg border border-stone-300 dark:border-amber-800/40 shadow-sm bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/30 dark:to-stone-800/30 flex items-center justify-center">
              <div className="text-center">
                <Music
                  size={48}
                  className="text-amber-600 dark:text-amber-400 mx-auto mb-4"
                />
                <div className="text-lg text-stone-600 dark:text-amber-300 mb-2">
                  No Audio URL Available
                </div>
                <div className="text-sm text-stone-500 dark:text-amber-400/70">
                  Audio player will appear here when available
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title and Info */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-stone-800 dark:text-amber-100 truncate">
            {selectedMessage?.title || "Untitled Sermon"}
          </h3>
          <p className="text-xs text-stone-600 dark:text-amber-300/80">
            {selectedMessage?.location || "Unknown Location"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-amber-300/70 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : "0:00"}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-stone-200 dark:bg-amber-900/30 rounded-full appearance-none cursor-pointer focus:outline-none accent-amber-500"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isLoading || !downloadUrl}
            className="p-2 rounded-lg bg-stone-100 dark:bg-amber-900/20 text-stone-600 dark:text-amber-300 hover:bg-stone-200 dark:hover:bg-amber-800/30 transition-all duration-200 disabled:opacity-50"
            aria-label="Download"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              <Download size={16} />
            )}
          </button>

          <button
            onClick={handlePlayPause}
            disabled={!audioUrl}
            className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {webUrl && (
            <button
              onClick={() => window.open(webUrl, "_blank")}
              className="p-2 rounded-lg bg-stone-100 dark:bg-amber-900/20 text-stone-600 dark:text-amber-300 hover:bg-stone-200 dark:hover:bg-amber-800/30 transition-all duration-200"
              aria-label="Open Website"
            >
              <Globe size={16} />
            </button>
          )}
        </div>

        {/* Audio Element (hidden) */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};

export default DownloadSermon;
