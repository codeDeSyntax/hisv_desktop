import React from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { useBibleContext } from '@/Provider/Bible';

const SettingsPanel: React.FC = () => {
  const { 
    setActiveFeature, 
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    verseTextColor,
    setVerseTextColor
  } = useBibleContext();

  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button onClick={() => setActiveFeature(null)} className="p-1">
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Theme Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2">Theme</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Sun size={18} className="mr-2" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Moon size={18} className="mr-2" />
              Dark
            </button>
          </div>
        </div>
        
        {/* Font Size Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2">Font Size</h3>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xl">Extra Large</option>
            <option value="2xl">XX-Large</option>
          </select>
        </div>
        
        {/* Font Family Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2">Font Family</h3>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="serif">Serif</option>
            <option value="sans">Sans-serif</option>
            <option value="mono">Monospace</option>
          </select>
        </div>
        
        {/* Text Color Setting */}
        <div>
          <h3 className="text-sm font-medium mb-2">Text Color</h3>
          <div className="flex items-center">
            <input
              type="color"
              value={verseTextColor}
              onChange={(e) => setVerseTextColor(e.target.value)}
              className="w-8 h-8 rounded mr-2 cursor-pointer"
            />
            <span className="text-sm">{verseTextColor}</span>
          </div>
        </div>
        
        {/* About Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-2">About</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bible 300 - Version 1.0.0
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A simple Bible app with multiple translations and customizable reading experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;