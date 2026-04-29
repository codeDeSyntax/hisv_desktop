import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import { Sermon } from "@/types";

interface ReceiptStylePanelProps {
  show: boolean;
  onClose: () => void;
  sermon: Sermon | null;
}

const ReceiptStylePanel = ({
  show,
  onClose,
  sermon,
}: ReceiptStylePanelProps) => {
  const { isDarkMode } = useTheme();

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-[60] backdrop-blur-[18px] backdrop-saturate-[1.2] ${
              isDarkMode ? "bg-zinc-950/18" : "bg-white/8"
            }`}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-[61] h-full w-full font-sans"
          >
            <div className="pointer-events-auto flex h-full w-full items-center justify-center px-3 py-4 sm:px-6 sm:py-6">
              <div className="relative w-full max-w-3xl bg-white py-3 max-h-[84%] overflow-y-auto no-scrollbar rounded-2xl">
                <button
                  onClick={onClose}
                  className={`absolute right-2 top-2 z-10 rounded-lg p-1.5 transition-all duration-200 hover:scale-105 sm:right-3 sm:top-3 ${
                    isDarkMode
                      ? "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                  }`}
                >
                  <X size={18} />
                </button>

                <div className="mb-4 text-center">
                  <h3
                    className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                      isDarkMode ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    Sermon Info
                  </h3>
                </div>

                {sermon && (
                  <div className="px-1 sm:px-2">
                    <div className="space-y-4">
                      <div className="space-y-1 text-center">
                        <h1
                          className={`mx-auto w-full break-words text-center text-[clamp(1rem,1vw,1.2rem)] font-bold leading-snug tracking-wide scale-x-[1.1] origin-center ${
                            isDarkMode ? "text-zinc-100" : "text-zinc-900"
                          }`}
                        >
                          {sermon.title}
                        </h1>
                      </div>

                      <div
                        className={`h-px ${
                          isDarkMode ? "bg-zinc-700/50" : "bg-zinc-200/70"
                        }`}
                      />

                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-center">
                        <div>
                          <div
                            className={`block origin-center scale-x-[1.1] text-[9px] font-semibold uppercase tracking-widest ${
                              isDarkMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            Location
                          </div>
                          <div
                            className={`mt-0.5 origin-center scale-x-[1.08] break-words text-xs font-medium tracking-wide ${
                              isDarkMode ? "text-zinc-100" : "text-zinc-800"
                            }`}
                          >
                            {sermon.location || "N/A"}
                          </div>
                        </div>

                        <div>
                          <div
                            className={`block origin-center scale-x-[1.1] text-[9px] font-semibold uppercase tracking-widest ${
                              isDarkMode ? "text-zinc-500" : "text-zinc-400"
                            }`}
                          >
                            Year
                          </div>
                          <div
                            className={`mt-0.5 origin-center scale-x-[1.08] break-words text-xs font-medium tracking-wide ${
                              isDarkMode ? "text-zinc-100" : "text-zinc-800"
                            }`}
                          >
                            {sermon.year || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReceiptStylePanel;
