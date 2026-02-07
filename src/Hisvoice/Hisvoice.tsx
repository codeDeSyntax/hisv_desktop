import React, { useState, useEffect } from "react";
import Home from "./Home";
import TitleBar from "@/shared/TitleBar";
import { useSermonContext } from "@/Provider/Vsermons";
import { motion, AnimatePresence } from "framer-motion";

const Hisvoice = () => {
  const { theme, isPresentationMode, setIsPresentationMode } =
    useSermonContext();

  // Handle ESC key to exit presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPresentationMode) {
        setIsPresentationMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode, setIsPresentationMode]);

  return (
    <div
      className="h-screen w-screen overflow-hidden no-scrollbar bg-white dark:bg-background"
      id="hisvoicediv"
    >
      <AnimatePresence>
        {!isPresentationMode && (
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <TitleBar />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="h-full"
        animate={{
          marginTop: isPresentationMode ? 0 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Home />
      </motion.div>
    </div>
  );
};

export default Hisvoice;
