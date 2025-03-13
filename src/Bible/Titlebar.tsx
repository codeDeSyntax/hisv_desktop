import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { useBibleContext } from '@/Provider/Bible';

const TitleBar: React.FC = () => {
  const { handleClose, handleMaximize, handleMinimize } = useBibleContext();

  return (
    <div className="h-10 bg-gray-200 dark:bg-gray-800 flex items-center px-4 border-b border-gray-300 dark:border-gray-700 select-none">
      <div className="flex space-x-2 mr-4">
        <button 
          onClick={handleClose}
          className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center group"
        >
          <X className="w-2 h-2 text-red-800 opacity-0 group-hover:opacity-100" />
        </button>
        <button 
          onClick={handleMinimize}
          className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center group"
        >
          <Minus className="w-2 h-2 text-yellow-800 opacity-0 group-hover:opacity-100" />
        </button>
        <button 
          onClick={handleMaximize}
          className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center group"
        >
          <Square className="w-2 h-2 text-green-800 opacity-0 group-hover:opacity-100" />
        </button>
      </div>
      <div className="text-sm font-medium flex-1 text-center">Bible 300</div>
    </div>
  );
};

export default TitleBar;