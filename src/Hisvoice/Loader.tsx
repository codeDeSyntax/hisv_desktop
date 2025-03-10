import { useState, useEffect } from 'react';

const Loader = () => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <style>
        {`
          @keyframes rock {
            0%, 100% {
              transform: rotate(-5deg);
            }
            50% {
              transform: rotate(5deg);
            }
          }

          .cloud {
            animation: rock 2s infinite;
          }
        `}
      </style>
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-primary" id="triggerElement">
        <img
          src="./cloud.png"
          className="cloud h-40 w-40"
          alt="cloud"
        />
        <div
          className={`text-white text-2xl font-mono transition-opacity duration-1000 ease-in-out ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          Welcome to His Voice....
        </div>
      </div>
    </div>
  );
};

export default Loader;
