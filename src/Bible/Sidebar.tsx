import React from "react";
import { Menu, X, Search, Star, RotateCcw, Book, Settings } from "lucide-react";
import { useBibleContext } from "../Provider/Bible";

const BibleSidebar: React.FC = () => {
  const {
    sidebarExpanded,
    setSidebarExpanded,
    activeFeature,
    setActiveFeature,
    searchOpen,
    setSearchOpen,
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
      className={`bg-gray-50 dark:bg-black flex flex-col fixed left-0 top-8 h-[calc(100vh-2rem)] z-20 shadow-md transition-all duration-300  ${
        sidebarExpanded ? "w-48" : "w-12"
      }`}
    >
      {/* Top sidebar button */}
      <div
        onClick={toggleSidebar}
        className="p-3 text-gray-900 dark:text-gray-300 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-bgray/50  text-left "
      >
        {sidebarExpanded ? <X size={20} style={{
             color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
        }} /> : <Menu size={20} style={{
             color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
        }} />}
      </div>

      {/* Sidebar menu items */}
      <div className="flex-1 flex flex-col">
        <div
          onClick={toggleSearch}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:bg-bgray/50 bg-gray-50  ${
            searchOpen ? "bg-gray-200 dark:bg-bgray" : ""
          }`}
        >
          <Search size={20} style={{
               color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
          }} />
          {sidebarExpanded && <span className="ml-3">Search</span>}
        </div>
        <div
          onClick={() => toggleFeature("favorites")}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-bgray/50  ${
            activeFeature === "favorites" ? "bg-gray-200 dark:bg-bgray" : ""
          }`}
        >
          <Star size={20} style={{
               color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
          }} />
          {sidebarExpanded && <span className="ml-3">Bookmarks</span>}
        </div>
        <div
          onClick={() => toggleFeature("history")}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-bgray/50  ${
            activeFeature === "history" ? "bg-gray-200 dark:bg-bgray" : ""
          }`}
        >
          <RotateCcw size={20} style={{
               color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
          }} />
          {sidebarExpanded && <span className="ml-3">History</span>}
        </div>
        <div
          onClick={() => toggleFeature("library")}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-bgray/50  ${
            activeFeature === "library" ? "bg-gray-200 dark:bg-bgray" : ""
          }`}
        >
          <Book size={20} style={{
               color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
          }} />
          {sidebarExpanded && <span className="ml-3">Library</span>}
        </div>
      </div>

      {/* Settings at bottom */}
      <div
        onClick={() => toggleFeature("settings")}
        className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-bgray/50 to ${
          activeFeature === "settings" ? "bg-gray-200 dark:bg-bgray" : ""
        }`}
      >
        <Settings size={20} style={{
             color: `rgba(${Math.floor(
                Math.random() * 255
              )},${Math.floor(Math.random() * 255)},${Math.floor(
                Math.random() * 255
              )},1)`,
        }} />
        {sidebarExpanded && <span className="ml-3">Settings</span>}
      </div>
    </div>
  );
};

export default BibleSidebar;
