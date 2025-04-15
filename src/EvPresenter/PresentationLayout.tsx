// components/PresentationLayout.tsx

import React from 'react';
import { useEvPresentationContext } from '@/Provider/EvPresent';
// import { usePresentationContext } from '@/contexts/PresentationContext';
import { X, Minus, Maximize2, ArrowLeft } from 'lucide-react';
import { useEastVoiceContext } from '@/Provider/EastVoice';

type PresentationLayoutProps = {
  children: React.ReactNode;
  title: string;
  hasBackButton?: boolean;
  onBackClick?: () => void;
};

export const PresentationLayout: React.FC<PresentationLayoutProps> = ({ 
  children, 
  title,
  hasBackButton = false,
  onBackClick
}) => {

  const {handleClose,handleMaximize,handleMinimize}  = useEastVoiceContext()
//   const { isPresentationMode } = usePresentationContext();/

  // Don't show window controls in presentation mode
//   if (isPresentationMode) {
//     return <div className="w-full h-full bg-white dark:bg-black">{children}</div>;
//   }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Window Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center">
          {hasBackButton && (
            <button 
              onClick={onBackClick}
              className="mr-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleMinimize}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <Minus size={16} />
          </button>
          <button 
            onClick={handleMaximize}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
};