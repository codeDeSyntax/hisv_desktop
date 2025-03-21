import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface PresentationOverlayProps {
  backgroundSrc: string;
  text: string;
  isPresenting: boolean;
  onClose: () => void;
}

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  backgroundSrc,
  text,
  isPresenting,
  onClose,
}) => {
  const [fadeIn, setFadeIn] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPresenting) {
        onClose();
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
  }, [isPresenting, onClose]);

  if (!isPresenting) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
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

      {/* Text content */}
      <div className="relative z-10 max-w-6xl w-full px-6 md:px-4">
        <div className="text-center">
          <p className="text-white font-bitter text-2xl md:text-4xl lg:text-6xl font- leading-loose  drop-shadow-lg">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresentationOverlay;
