import React from 'react';
import { X, Search } from 'lucide-react';
import { useBibleContext } from '@/Provider/Bible';
import { BookmarkPanel } from './BookmarkPanel';
import HistoryPanel from './HistoryPanel';
import LibraryPanel from './LibraryPanel';
import SettingsPanel from './SettingsPanel';

const FeaturePanel: React.FC = () => {
  const { activeFeature, setActiveFeature, sidebarExpanded } = useBibleContext();

  if (!activeFeature) return null;

  const renderPanel = () => {
    switch (activeFeature) {
      case 'favorites':
        return <BookmarkPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'library':
        return <LibraryPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-64 md:w-80 border-r border-gray-300 dark:border-gray-700 overflow-y-auto h-[calc(100vh-2.5rem)] fixed top-10 ${
      sidebarExpanded ? 'left-48' : 'left-12'
    } bg-black transition-all duration-300 z-10`}>
      {renderPanel()}
    </div>
  );
};

export default FeaturePanel;