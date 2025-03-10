import  { useState } from 'react';
import { Minus, Square, X } from 'lucide-react';


const TitleBar = ({ title = 'His voice' }) => {
  const [isHovered, setIsHovered] = useState(null);

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  return (
    <div
      className="h-6 bg-[#202020]  z-20  fixed w-screen flex items-center justify-between px-2 select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div
        className="flex items-center space-x-2 ml-2"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={handleClose}
          onMouseEnter={() => setIsHovered('close')}
          onMouseLeave={() => setIsHovered(null)}
          className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-red-600 flex items-center justify-center"
        >
          {isHovered === 'close' && <X size={10} className="text-white" />}
        </button>
        <button
          onClick={handleMinimize}
          onMouseEnter={() => setIsHovered('minimize')}
          onMouseLeave={() => setIsHovered(null)}
          className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-yellow-600 flex items-center justify-center"
        >
          {isHovered === 'minimize' && (
            <Minus size={10} className="text-white" />
          )}
        </button>
        <button
          onClick={handleMaximize}
          onMouseEnter={() => setIsHovered('maximize')}
          onMouseLeave={() => setIsHovered(null)}
          className="w-3 h-3 rounded-full bg-[#28CA41] hover:bg-green-600 flex items-center justify-center"
        >
          {isHovered === 'maximize' && (
            <Square size={10} className="text-white" />
          )}
        </button>
        {/* <DarkModeToggle /> */}
      </div>

      <div className="  text-sm bg-[#202020] border-b border-gray-500 px-2 rounded-xl text-clip italic gap-2 text-white flex items-center justify-between">
        <p
          className="font-mono text-clip shadow-lg 
       text-[13px] tracking-widest"
        >
          {' '}
          {title}
        </p>
        {/* title bar icon */}
        <img
          src="./cloud.png"
          alt="titleblogo"
          className="size-4 animate-bounce"
          color="red"
        />
      </div>
    </div>
  );
};

export default TitleBar;
