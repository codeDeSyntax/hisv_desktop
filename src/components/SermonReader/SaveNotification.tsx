import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SaveNotificationProps {
  show: boolean;
  onClose: () => void;
}

const SaveNotification = ({ show, onClose }: SaveNotificationProps) => {
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
          className="fixed z-30 bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Progress saved successfully! ✓
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveNotification;
