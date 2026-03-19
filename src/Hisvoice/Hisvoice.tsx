import React, { useState, useEffect } from "react";
import Home from "./Home";
import PresentationView from "./PresentationView";
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

  if (isPresentationMode) {
    return (
      <div
        className="h-screen w-screen overflow-hidden no-scrollbar bg-white dark:bg-background"
        id="hisvoicediv"
      >
        <PresentationView />
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden no-scrollbar bg-white dark:bg-background"
      id="hisvoicediv"
    >
      <TitleBar />
      <div className="h-full">
        <Home />
      </div>
    </div>
  );
};

export default Hisvoice;
