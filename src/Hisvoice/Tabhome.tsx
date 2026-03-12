import React from "react";
import { useTheme } from "../Provider/Theme";

const TabHome = () => {
  const { isDarkMode } = useTheme();

  const handleOpenSermons = () => {
    // Trigger navigation to sermons by dispatching a custom event
    window.dispatchEvent(new CustomEvent("navigate-to-sermons"));
  };

  return (
    <>
      <style>{`
        @keyframes morphGradient {
          0%, 100% {
            background-position: 0% 50%;
            background-size: 200% 200%;
          }
          50% {
            background-position: 100% 50%;
            background-size: 200% 200%;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
      <div className="relative h-full overflow-y-auto no-scrollbar">
        {/* Artistic Background - Morphing Gradient with Concentric Circles */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Simple gradient - dark corner to normal theme */}
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-br from-stone-950 to-stone-900"
                : "bg-gradient-to-br from-stone-200 to-stone-50"
            }`}
          />

          {/* Concentric circles - centered with spiral effect */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="circleGradient">
                <stop
                  offset="0%"
                  stopColor={isDarkMode ? "#78716c" : "#d6d3d1"}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={isDarkMode ? "#78716c" : "#d6d3d1"}
                  stopOpacity="0"
                />
              </radialGradient>
            </defs>

            {/* Multiple concentric circles creating spiral effect */}
            <g>
              {Array.from({ length: 15 }).map((_, i) => {
                const radius = 20 + i * 40;
                const opacity = Math.max(0.05, 0.15 - i * 0.008);
                const rotation = i * 8; // Rotation for spiral effect
                return (
                  <circle
                    key={i}
                    cx="50%"
                    cy="40%"
                    r={radius}
                    fill="none"
                    stroke={isDarkMode ? "#78716c" : "#a8a29e"}
                    strokeWidth="1"
                    opacity={opacity}
                    strokeDasharray={`${2 + i * 0.5} ${3 + i * 0.3}`}
                    strokeDashoffset={rotation}
                    transform={`rotate(${rotation} 50% 40%)`}
                    style={{ transformOrigin: "50% 40%" }}
                  />
                );
              })}
            </g>

            {/* Subtle glow at center */}
            <circle
              cx="50%"
              cy="40%"
              r="150"
              fill="url(#circleGradient)"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Content - no background or shadow */}
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center p-6">
          <div className="p-4">
            <img
              src="./books.svg"
              alt="Books"
              className="w-36 h-36 mb-2 opacity-70 mx-auto"
            />
            <h2
              className="text-lg md:text-xl font-serif font-normal text-stone-700 dark:text-stone-200 mb-4 leading-relaxed max-w-2xl "
              style={{ fontFamily: "COPPERPLATE GOTHIC" }}
            >
              And I saw another mighty angel come down from heaven, clothed with
              a cloud: and a rainbow was upon his head, and his face was as it
              were the sun, and his feet as pillars of fire
            </h2>
            <p
              className="text-sm text-stone-600 dark:text-stone-300 mb-8 font-serif"
              style={{ fontFamily: "COPPERPLATE GOTHIC" }}
            >
              Revelation 10:1
            </p>
            <button
              onClick={handleOpenSermons}
              className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <img src="./books.svg" alt="Books" className="w-5 h-5" />
              Open Sermons
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenSermons}
          className="absolute bottom-6 right-6 h-14 flex items-center justify-center w-14 bg-primary p-4 rounded-full shadow-2xl text-white hover:bg-primary/90 transition-colors z-50"
        >
          <img src="./books.svg" alt="Books" className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default TabHome;
