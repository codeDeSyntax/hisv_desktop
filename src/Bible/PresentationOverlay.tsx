import React, { useEffect, useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

interface PresentationOverlayProps {
  backgroundSrc: string;
  text: string;
  isPresenting: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentVerse?: number;
  totalVerses?: number;
}

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  backgroundSrc,
  text,
  isPresenting,
  onClose,
  onNext,
  onPrev,
  currentVerse,
  totalVerses,
}) => {
  const [fadeIn, setFadeIn] = useState(false);

  // Handle Escape key and navigation keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPresenting) {
        onClose();
      }
      // Add navigation with left and right arrow keys
      if (isPresenting) {
        if (event.key === "ArrowRight" && onNext) {
          onNext();
        }
        if (event.key === "ArrowLeft" && onPrev) {
          onPrev();
        }
      }
    };

    // Add animation on mount
    if (isPresenting) {
      // Small delay to trigger animation
      setTimeout(() => setFadeIn(true), 10);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPresenting, onClose, onNext, onPrev]);

  if (!isPresenting) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 overflow-y-scroll no-scrollbar ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background overlay with image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      >
        {/* Optional overlay for better text visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors duration-200 z-10"
        aria-label="Close presentation"
      >
        <X size={24} />
      </button>

      {/* Navigation buttons */}
      {onPrev && (
        <button
          onClick={onPrev}
          disabled={currentVerse === 1}
          className="absolute left-6 bottom-0 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors duration-200 z-10 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous verse"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          disabled={currentVerse === totalVerses}
          className="absolute right-6 bottom-0 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors duration-200 z-10 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next verse"
        >
          <ArrowRight size={24} />
        </button>
      )}

      {/* Verse number indicator */}
      {currentVerse && totalVerses && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
          Verse {currentVerse} of {totalVerses}
        </div>
      )}

      {/* Text content */}
      <div className="relative z-10 max-w-6xl w-full px-6 md:px-4 overflow-y-scroll no-scrollbar">
        <div className="leading-normal">
          <p className="text-white font-serif font- text-2xl md:text-4xl lg:text-6xl font-bold  leading-loose tracking-wide drop-shadow-lg">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresentationOverlay;
