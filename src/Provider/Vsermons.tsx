import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import earlySermons from "../sermons/1964-1969/firstset.js";
import secondSet from "../sermons/1970/1970.js";
import thirdSet from "../sermons/1971/1971";
import fourthSet from "../sermons/1972/1972";
import lastSet from "../sermons/1973/1973";
import audioSermons from "@/sermons/audio.js";

import { Sermon } from "@/types/index.js";

// Define bookmark type
interface Bookmark {
  id: string;
  sermonId: string;
  sermonTitle: string;
  paragraphId: number;
  paragraphContent: string; // First 100 characters for preview
  createdAt: string;
  location?: string;
  year?: string;
}

// Define settings type
interface SermonSettings {
  fontFamily: string;
  fontStyle: string;
  fontSize: string;
  fontWeight: string;
}

// Define search navigation type
interface SearchNavigation {
  targetSermonId: string | number;
  targetParagraphId: number;
  searchTerm: string;
}

// Define the context value type
interface SermonContextType {
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;
  selectedMessage: Sermon | null;
  allSermons: Sermon[];
  loading: boolean;
  error: string | null;
  recentSermons: Sermon[];
  setRecentSermons: (sermons: Sermon[]) => void;
  setSelectedMessage: (sermon: Sermon | null) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  prevScreen: string; 
  setPrevScreen: (screen: string) => void;
  setTheme: (tab: string) => void;
  theme: string;
  randomSermons: Sermon[];
  setRandomSermons: (sermons: Sermon[]) => void;
  getThreeRandomSermons: () => Sermon[];
  setSearchQuery: (query: string) => void;
  searchQuery: string;
  settings: SermonSettings;
  setSettings: (settings: SermonSettings) => void;
  CB: number;
  setCB: (cb: number) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  // Bookmark functions
  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (sermonId: string, sermonTitle: string, paragraphId: number, paragraphContent: string, location?: string, year?: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  isBookmarked: (sermonId: string, paragraphId: number) => boolean;
  toggleBookmark: (sermonId: string, sermonTitle: string, paragraphId: number, paragraphContent: string, location?: string, year?: string) => void;
  navigateToBookmark: (bookmark: Bookmark) => void;
  // Search navigation
  pendingSearchNav: SearchNavigation | null;
  setPendingSearchNav: (nav: SearchNavigation | null) => void;
  navigateToSearchResult: (sermonId: string | number, paragraphId: number, searchTerm: string) => void;
}

// Create the context with an initial undefined value
const SermonContext = createContext<SermonContextType | undefined>(undefined);

// Define props for the provider component
interface SermonProviderProps {
  children: ReactNode;
}

// Ensure sermon collection is properly typed
const sermonCollection: Sermon[] = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const SermonProvider = ({ children }: SermonProviderProps) => {
  const [selectedMessage, setSelectedMessage] = useState<Sermon | null>(null);
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [randomSermons, setRandomSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [CB, setCB] = useState<number>(0);
  const [prevScreen ,setPrevScreen] = useState(activeTab)
  const [pendingSearchNav, setPendingSearchNav] = useState<SearchNavigation | null>(null);
  const [theme, setTheme] = useState(
    localStorage.getItem("vsermontheme") || "light"
  );
  const [settings, setSettings] = useState<SermonSettings>({
    fontFamily: "Zilla Slab",
    fontStyle: "normal",
    fontSize: "20",
    fontWeight: "normal",
  });

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  //always check for current screen and set it to prevScreen in local storage
  useEffect(() => {
    localStorage.setItem("prevScreen", activeTab);
  }, [activeTab]);

  // Generate random sermon
  const getRandomSermon = (): Sermon | null => {
    if (sermonCollection.length > 0) {
      const randomIndex = Math.floor(Math.random() * sermonCollection.length);
      return sermonCollection[randomIndex];
    }
    return null;
  };

  // Generate three random sermons
  const getThreeRandomSermons = (): Sermon[] => {
    const sermons = new Set<Sermon>();
    while (sermons.size < 3 && sermons.size < sermonCollection.length) {
      const sermon = getRandomSermon();
      if (sermon) {
        sermons.add(sermon);
      }
    }
    return Array.from(sermons);
  };

  // Search navigation function
  const navigateToSearchResult = (sermonId: string | number, paragraphId: number, searchTerm: string) => {
    const targetSermon = allSermons.find(s => s.id === sermonId);
    if (targetSermon) {
      setSelectedMessage(targetSermon);
      setSearchQuery(searchTerm);
      setPendingSearchNav({
        targetSermonId: sermonId,
        targetParagraphId: paragraphId,
        searchTerm: searchTerm
      });
      setActiveTab("message");

      // Update recent sermons
      const existingRecent = JSON.parse(localStorage.getItem("recentSermons") || "[]");
      const filteredRecent = existingRecent.filter((item: { id: string | number }) => item.id !== sermonId);
      filteredRecent.unshift(targetSermon);
      const limitedRecent = filteredRecent.slice(0, 15);
      localStorage.setItem("recentSermons", JSON.stringify(limitedRecent));
      setRecentSermons(limitedRecent);
    }
  };

  // Bookmark functions
  const addBookmark = (
    sermonId: string, 
    sermonTitle: string, 
    paragraphId: number, 
    paragraphContent: string,
    location?: string,
    year?: string
  ) => {
    const newBookmark: Bookmark = {
      id: `${sermonId}-${paragraphId}-${Date.now()}`,
      sermonId,
      sermonTitle,
      paragraphId,
      paragraphContent: paragraphContent.substring(0, 100) + (paragraphContent.length > 100 ? '...' : ''),
      createdAt: new Date().toISOString(),
      location,
      year,
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem("sermonBookmarks", JSON.stringify(updatedBookmarks));
  };

  const removeBookmark = (bookmarkId: string) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    localStorage.setItem("sermonBookmarks", JSON.stringify(updatedBookmarks));
  };

  const isBookmarked = (sermonId: string, paragraphId: number): boolean => {
    return bookmarks.some(bookmark => 
      bookmark.sermonId === sermonId && bookmark.paragraphId === paragraphId
    );
  };

  const toggleBookmark = (
    sermonId: string, 
    sermonTitle: string, 
    paragraphId: number, 
    paragraphContent: string,
    location?: string,
    year?: string
  ) => {
    const existingBookmark = bookmarks.find(bookmark => 
      bookmark.sermonId === sermonId && bookmark.paragraphId === paragraphId
    );

    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
    } else {
      addBookmark(sermonId, sermonTitle, paragraphId, paragraphContent, location, year);
    }
  };

  const navigateToBookmark = (bookmark: Bookmark) => {
    // Find the sermon in allSermons
    const sermon = allSermons.find(s => s.id === bookmark.sermonId);
    if (sermon) {
      setSelectedMessage(sermon);
      setActiveTab("message"); // Assuming reader is the tab for reading sermons
      
      // Wait for the component to render then scroll to the paragraph
      setTimeout(() => {
        const element = document.getElementById(`paragraph-${bookmark.paragraphId}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            
            block: 'end',  // Changed from 'center' to 'start'
            inline: 'nearest'  // Added this for better positioning
          });
        }
      }, 100);
    }
  };

  // Load bookmarks and settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("sermonSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings) as SermonSettings;
      setSettings({
        fontFamily: parsedSettings.fontFamily,
        fontStyle: parsedSettings.fontStyle,
        fontSize: parsedSettings.fontSize,
        fontWeight: parsedSettings.fontWeight,
      });
    }

    const recentSermonsJson = localStorage.getItem("recentSermons");
    const recentSermons = recentSermonsJson
      ? (JSON.parse(recentSermonsJson) as Sermon[])
      : [];
    setRecentSermons(recentSermons);

    // Load bookmarks
    const savedBookmarks = localStorage.getItem("sermonBookmarks");
    if (savedBookmarks) {
      const parsedBookmarks = JSON.parse(savedBookmarks) as Bookmark[];
      setBookmarks(parsedBookmarks);
    }
  }, []);

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoading(true);

        const fetchedSermons: Sermon[] = [
          ...earlySermons,
          ...secondSet,
          ...thirdSet,
          ...fourthSet,
          ...lastSet,
          ...audioSermons,
        ];

        setAllSermons(fetchedSermons);

        // Wait until allSermons is set before getting random sermons
        const randomSermon = getRandomSermon();
        setSelectedMessage(randomSermon);

        const threeRandomSermons = getThreeRandomSermons();
        setRandomSermons(threeRandomSermons);

        setLoading(false);
        console.log("Sermons loaded:", fetchedSermons.length);
        // console.log("Three random sermons:", threeRandomSermons);
      } catch (err) {
        console.error("Error loading sermons:", err);
        setError("Failed to load sermons. Please try again later.");
        setLoading(false);
      }
    };

    loadSermons(); // Call the function to load sermons on component mount
  }, []);

  const contextValue: SermonContextType = {
    handleClose,
    handleMaximize,
    handleMinimize,
    selectedMessage,
    allSermons,
    loading,
    error,
    recentSermons,
    setRecentSermons,
    setSelectedMessage,
    setActiveTab,
    activeTab,
    prevScreen,
    setPrevScreen,
    randomSermons,
    setRandomSermons,
    getThreeRandomSermons,
    setSearchQuery,
    searchQuery,
    settings,
    setSettings,
    CB,
    setCB,
    isCollapsed,
    setIsCollapsed,
    theme,
    setTheme,
    // Bookmark functions
    bookmarks,
    setBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    navigateToBookmark,
    // Search navigation
    pendingSearchNav,
    setPendingSearchNav,
    navigateToSearchResult,
  };

  // console.log("SermonProvider rendering, context value:", contextValue);

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
      {error && <div className="error">{error}</div>}
    </SermonContext.Provider>
  );
};

// Export a custom hook to use the sermon context
export const useSermonContext = (): SermonContextType => {
  const context = useContext(SermonContext);
  if (context === undefined) {
    throw new Error("useSermonContext must be used within a SermonProvider");
  }
  return context;
};

export { SermonContext, SermonProvider };