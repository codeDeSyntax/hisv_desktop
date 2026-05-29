import { useState, useRef, useEffect } from "react";
import { Button, Slider, Tooltip } from "antd";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";

const ModernAudioPlayer = () => {
  const { selectedMessage } = useSermonContext();
  const { isDarkMode } = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const downloadUrl = selectedMessage?.downloadLink || "";
  const sermonTitle = selectedMessage?.title || "Untitled Sermon";
  const sermonDate = selectedMessage?.date || selectedMessage?.year || "";
  const sermonLocation = selectedMessage?.location || "";

  useEffect(() => {
    // Reset player when sermon changes
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(true);
  }, [selectedMessage?.id]);

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
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = Number(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = Number(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + 10,
      duration,
    );
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      audioRef.current.currentTime - 10,
      0,
    );
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-full w-full flex items-center justify-center p-3 md:p-6 font-zilla">
      <audio
        ref={audioRef}
        src={downloadUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="w-full max-w-3xl px-1 sm:px-3">
        {/* Main Player - Spotify Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 bg-zinc-100/50 dark:bg-zinc-800/30 p-4 md:p-6 rounded-2xl"
        >
          {/* Top Section: Album Art + Info Side by Side */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
            {/* Album Art */}
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
              className="w-full md:w-56 flex-shrink-0"
            >
              <div className="relative aspect-square roundd-full overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 shadow-lg">
                <img
                  src="./wood7.png"
                  alt="Sermon Cover"
                  className="w-full h-full object-cover"
                />
                {/* Overlay for playing state */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
                  />
                )}
              </div>
            </motion.div>

            {/* Sermon Info & Controls */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Top Info */}
              <div>
                <div className="mb-1">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Sermon
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-tight">
                  {sermonTitle}
                </h1>
                <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  {sermonDate && (
                    <span className="font-medium">{sermonDate}</span>
                  )}
                  {sermonDate && sermonLocation && (
                    <span className="text-zinc-400 dark:text-zinc-500">•</span>
                  )}
                  {sermonLocation && (
                    <span className="font-medium">{sermonLocation}</span>
                  )}
                </div>
              </div>

              {/* Player Controls */}
              <div className="space-y-3 mt-4">
                {/* Main Controls */}
                <div className="flex items-center gap-2">
                  {/* Large Play/Pause Button */}
                  <Button
                    onClick={handlePlayPause}
                    loading={isLoading}
                    shape="circle"
                    size="large"
                    type="primary"
                    className="!w-11 !h-11 !bg-zinc-800 dark:!bg-zinc-700 hover:!bg-zinc-900 dark:hover:!bg-zinc-600 !border-none !shadow-md"
                    icon={
                      isPlaying ? (
                        <Pause
                          size={18}
                          className={
                            isDarkMode ? "text-zinc-100" : "text-white"
                          }
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          size={18}
                          className={
                            isDarkMode
                              ? "text-zinc-100 ml-0.5"
                              : "text-white ml-0.5"
                          }
                          fill="currentColor"
                        />
                      )
                    }
                  />

                  {/* Skip Backward */}
                  <Tooltip title="Skip backward 10s" placement="top">
                    <Button
                      onClick={skipBackward}
                      shape="circle"
                      type="text"
                      className="!w-9 !h-9 hover:!bg-zinc-300 dark:hover:!bg-zinc-700"
                      icon={
                        <SkipBack
                          size={16}
                          className={
                            isDarkMode ? "text-zinc-200" : "text-zinc-800"
                          }
                        />
                      }
                    />
                  </Tooltip>

                  {/* Skip Forward */}
                  <Tooltip title="Skip forward 10s" placement="top">
                    <Button
                      onClick={skipForward}
                      shape="circle"
                      type="text"
                      className="!w-9 !h-9 hover:!bg-zinc-300 dark:hover:!bg-zinc-700"
                      icon={
                        <SkipForward
                          size={16}
                          className={
                            isDarkMode ? "text-zinc-200" : "text-zinc-800"
                          }
                        />
                      }
                    />
                  </Tooltip>

                  {/* Download Button */}
                  <Tooltip title="Download" placement="top">
                    <Button
                      onClick={handleDownload}
                      shape="circle"
                      type="text"
                      className="!w-9 !h-9 hover:!bg-zinc-300 dark:hover:!bg-zinc-700 !ml-1"
                      icon={
                        <Download
                          size={16}
                          className={
                            isDarkMode ? "text-zinc-200" : "text-zinc-800"
                          }
                        />
                      }
                    />
                  </Tooltip>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <Slider
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(value) => {
                      if (!audioRef.current) return;
                      audioRef.current.currentTime = value;
                      setCurrentTime(value);
                    }}
                    tooltip={{ formatter: (value) => formatTime(value || 0) }}
                    trackStyle={{
                      backgroundColor: isDarkMode ? "#78716c" : "#57534e",
                    }}
                    railStyle={{
                      backgroundColor: isDarkMode ? "#44403c" : "#e7e5e4",
                    }}
                    handleStyle={{
                      borderColor: isDarkMode ? "#78716c" : "#57534e",
                    }}
                    className="!mb-0"
                  />
                  <div className="flex justify-between text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleMute}
                    shape="circle"
                    type="text"
                    size="small"
                    className="!p-1.5 hover:!bg-zinc-300 dark:hover:!bg-zinc-700"
                    icon={
                      isMuted || volume === 0 ? (
                        <VolumeX
                          size={16}
                          className={
                            isDarkMode ? "text-zinc-200" : "text-zinc-800"
                          }
                        />
                      ) : (
                        <Volume2
                          size={16}
                          className={
                            isDarkMode ? "text-zinc-200" : "text-zinc-800"
                          }
                        />
                      )
                    }
                  />
                  <div className="flex-1 max-w-[100px]">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(value) => {
                        if (!audioRef.current) return;
                        audioRef.current.volume = value;
                        setVolume(value);
                        setIsMuted(value === 0);
                      }}
                      tooltip={{
                        formatter: (value) =>
                          `${Math.round((value || 0) * 100)}%`,
                      }}
                      trackStyle={{
                        backgroundColor: isDarkMode ? "#78716c" : "#57534e",
                      }}
                      railStyle={{
                        backgroundColor: isDarkMode ? "#44403c" : "#e7e5e4",
                      }}
                      handleStyle={{
                        borderColor: isDarkMode ? "#78716c" : "#57534e",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernAudioPlayer;
