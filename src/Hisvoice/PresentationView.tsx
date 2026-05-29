import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSermonContext } from "@/Provider/Vsermons";

const SelectedSermon = lazy(() => import("./SelectedSermon"));

/**
 * Full-screen presentation view — no left panel, no spine, no title bar.
 * Renders the sermon reader at maximum size for projecting / reading aloud.
 */
const PresentationView = () => {
  const { selectedMessage } = useSermonContext();
  const [background, setBackground] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Auto-hide the "Presentation Mode" hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-stone-50 dark:bg-background">
      {/* Presentation Mode Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 b backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <span className="text-sm font-medium">Presentation Mode</span>
            <span className="text-xs opacity-75">•</span>
            <span className="text-xs opacity-75">Press ESC to exit</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-width sermon panel */}
      <div className="flex-1 h-full flex overflow-hidden">
        <div className="relative w-full h-full overflow-hidden flex flex-col">
          {selectedMessage ? (
            <Suspense fallback={null}>
              <SelectedSermon
                background={background}
                setBackground={setBackground}
              />
            </Suspense>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 dark:text-stone-600">
              <span className="text-lg">No sermon selected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationView;
