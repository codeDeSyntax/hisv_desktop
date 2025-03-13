import React from 'react';
import { Menu, X, Search, Star, RotateCcw, Book, Settings } from 'lucide-react';
import { useBibleContext } from '../Provider/Bible';


const BibleSidebar: React.FC = () => {
  const { 
    sidebarExpanded, 
    setSidebarExpanded, 
    activeFeature, 
    setActiveFeature,
    searchOpen,
    setSearchOpen,
    theme
  } = useBibleContext();

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const toggleFeature = (feature: string) => {
    if (activeFeature === feature) {
      setActiveFeature(null);
    } else {
      setActiveFeature(feature);
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <div 
      className={` bg-black flex flex-col fixed left-0 top-10 h-[calc(100vh-2.5rem)] z-20 shadow-md transition-all duration-300 ${
        sidebarExpanded ? 'w-48' : 'w-12'
      }`}
    >
      {/* Top sidebar button */}
      <div
        onClick={toggleSidebar}
        className="p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left"
      >
        {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
      </div>

      {/* Sidebar menu items */}
      <div className="flex-1 flex flex-col">
        <div
          onClick={toggleSearch}
          className={`p-3 flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${
            searchOpen ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          <Search size={20} />
          {sidebarExpanded && <span className="ml-3">Search</span>}
        </div>
        <div
          onClick={() => toggleFeature('favorites')}
          className={`p-3 flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${
            activeFeature === 'favorites' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          <Star size={20} />
          {sidebarExpanded && <span className="ml-3">Bookmarks</span>}
        </div>
        <div
          onClick={() => toggleFeature('history')}
          className={`p-3 flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${
            activeFeature === 'history' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          <RotateCcw size={20} />
          {sidebarExpanded && <span className="ml-3">History</span>}
        </div>
        <div
          onClick={() => toggleFeature('library')}
          className={`p-3 flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${
            activeFeature === 'library' ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          <Book size={20} />
          {sidebarExpanded && <span className="ml-3">Library</span>}
        </div>
      </div>

      {/* Settings at bottom */}
      <div
        onClick={() => toggleFeature('settings')}
        className={`p-3 flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mt-auto ${
          activeFeature === 'settings' ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Settings size={20} />
        {sidebarExpanded && <span className="ml-3">Settings</span>}
      </div>
    </div>
  );
};

export default BibleSidebar;