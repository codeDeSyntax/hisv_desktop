// components/PresentationSlideshow.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEvPresentationContext } from "@/Provider/EvPresent";
import { Presentation } from "@/types";

interface SlideProps {
  content: React.ReactNode;
  currentSlide: number;
  slideIndex: number;
}

const Slide: React.FC<SlideProps> = ({ content, currentSlide, slideIndex }) => {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      custom={currentSlide > slideIndex ? 1 : -1}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center p-10"
    >
      <div className="w-full max-w-4xl text-center">{content}</div>
    </motion.div>
  );
};

export const PresentationSlideshow: React.FC = () => {
  const { currentPresentation, stopPresentation } = useEvPresentationContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [slides, setSlides] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!currentPresentation) return;

    const buildSlides = () => {
      const newSlides: React.ReactNode[] = [];

      // Title slide
      newSlides.push(
        <div className="space-y-6">
          <h1 className="text-5xl font-bold">{currentPresentation.title}</h1>
          {currentPresentation.type === "sermon" && (
            <h2 className="text-3xl text-gray-600 dark:text-gray-400">
              by {(currentPresentation as any).preacher}
            </h2>
          )}
        </div>
      );

      if (currentPresentation.type === "sermon") {
        // Scriptures slides
        (currentPresentation as any).scriptures.forEach((scripture: any) => {
          newSlides.push(
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">Scripture</h2>
              <p className="text-4xl italic">{scripture.text}</p>
            </div>
          );
        });

        // Main message slide (if exists)
        if ((currentPresentation as any).mainMessage) {
          newSlides.push(
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">Main Message</h2>
              <p className="text-4xl">
                {(currentPresentation as any).mainMessage}
              </p>
            </div>
          );
        }

        // Quote slide (if exists)
        if ((currentPresentation as any).quote) {
          newSlides.push(
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">Quote</h2>
              <p className="text-4xl italic">
                "{(currentPresentation as any).quote}"
              </p>
            </div>
          );
        }
      } else {
        // Content slide for "other" type
        newSlides.push(
          <div className="space-y-6">
            <p className="text-4xl">{(currentPresentation as any).message}</p>
          </div>
        );
      }

      return newSlides;
    };

    setSlides(buildSlides());
    setCurrentSlide(0);
  }, [currentPresentation]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "Space" || e.key === " ") {
      nextSlide();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "Escape") {
      stopPresentation();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slides.length]);

  if (!currentPresentation) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-black text-black dark:text-white z-50">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={stopPresentation}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <Slide
            key={currentSlide}
            content={slides[currentSlide]}
            currentSlide={currentSlide}
            slideIndex={currentSlide}
          />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
        <button
          onClick={prevSlide}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center bg-gray-200 dark:bg-gray-800 px-4 py-1 rounded-full">
          <span>
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
        <button
          onClick={nextSlide}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
