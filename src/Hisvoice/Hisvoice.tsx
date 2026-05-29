import React, { useEffect } from "react";
import Home from "./Home";
import PresentationView from "./PresentationView";
import TitleBar from "@/shared/TitleBar";
import { useSermonContext } from "@/Provider/Vsermons";

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      'input, textarea, select, button, [contenteditable="true"], [role="textbox"]',
    ),
  );
};

const Hisvoice = () => {
  const { theme, isPresentationMode, setIsPresentationMode } =
    useSermonContext();

  // Handle keyboard presentation controls.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPresentationMode) {
        setIsPresentationMode(false);
        return;
      }

      if (
        e.code === "Space" &&
        !isPresentationMode &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isTypingTarget(e.target)
      ) {
        e.preventDefault();
        setIsPresentationMode(true);
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
      className="h-screen w-screen overflow-hidden no-scrollbar "
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
