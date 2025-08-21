import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { Sermon } from "@/types/index.js";

// Lazy imports for sermon data - only load when needed
const loadEarlySermons = () => import("../sermons/1964-1969/firstset.js");
const loadSecondSet = () => import("../sermons/1970/1970.js");
const loadThirdSet = () => import("../sermons/1971/1971");
const loadFourthSet = () => import("../sermons/1972/1972");
const loadLastSet = () => import("../sermons/1973/1973");
const loadAudioSermons = () => import("@/sermons/audio.js");

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
  loadingProgress: number;
  loadingMessage: string;
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
  addBookmark: (
    sermonId: string,
    sermonTitle: string,
    paragraphId: number,
    paragraphContent: string,
    location?: string,
    year?: string
  ) => void;
  removeBookmark: (bookmarkId: string) => void;
  isBookmarked: (sermonId: string, paragraphId: number) => boolean;
  toggleBookmark: (
    sermonId: string,
    sermonTitle: string,
    paragraphId: number,
    paragraphContent: string,
    location?: string,
    year?: string
  ) => void;
  navigateToBookmark: (bookmark: Bookmark) => void;
  // Search navigation
  pendingSearchNav: SearchNavigation | null;
  setPendingSearchNav: (nav: SearchNavigation | null) => void;
  navigateToSearchResult: (
    sermonId: string | number,
    paragraphId: number,
    searchTerm: string
  ) => void;
}

// Create the context with an initial undefined value
const SermonContext = createContext<SermonContextType | undefined>(undefined);

// Define props for the provider component
interface SermonProviderProps {
  children: ReactNode;
}

// Ensure sermon collection is properly typed - will be loaded lazily
let sermonCollection: Sermon[] = [];

const SermonProvider = ({ children }: SermonProviderProps) => {
  const [selectedMessage, setSelectedMessage] = useState<Sermon | null>(null);
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] =
    useState<string>("Starting up...");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [randomSermons, setRandomSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [CB, setCB] = useState<number>(0);
  const [prevScreen, setPrevScreen] = useState(activeTab);
  const [pendingSearchNav, setPendingSearchNav] =
    useState<SearchNavigation | null>(null);
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

  // Generate random sermon (text sermons only)
  const getRandomSermon = (): Sermon | null => {
    // Filter for text sermons only (exclude audio/video/mp3)
    const textSermons = sermonCollection.filter(
      (sermon) => sermon.type === "text"
    );

    if (textSermons.length > 0) {
      const randomIndex = Math.floor(Math.random() * textSermons.length);
      return textSermons[randomIndex];
    }
    return null;
  };

  // Generate three random sermons (text sermons only)
  const getThreeRandomSermons = (): Sermon[] => {
    // Filter for text sermons only (exclude audio/video/mp3)
    const textSermons = sermonCollection.filter(
      (sermon) => sermon.type === "text"
    );

    const sermons = new Set<Sermon>();
    while (sermons.size < 3 && sermons.size < textSermons.length) {
      const randomIndex = Math.floor(Math.random() * textSermons.length);
      const sermon = textSermons[randomIndex];
      if (sermon) {
        sermons.add(sermon);
      }
    }
    return Array.from(sermons);
  };

  // Search navigation function
  const navigateToSearchResult = (
    sermonId: string | number,
    paragraphId: number,
    searchTerm: string
  ) => {
    const targetSermon = allSermons.find((s) => s.id === sermonId);
    if (targetSermon) {
      setSelectedMessage(targetSermon);
      setSearchQuery(searchTerm);
      setPendingSearchNav({
        targetSermonId: sermonId,
        targetParagraphId: paragraphId,
        searchTerm: searchTerm,
      });
      setActiveTab("message");

      // Update recent sermons
      const existingRecent = JSON.parse(
        localStorage.getItem("recentSermons") || "[]"
      );
      const filteredRecent = existingRecent.filter(
        (item: { id: string | number }) => item.id !== sermonId
      );
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
      paragraphContent:
        paragraphContent.substring(0, 100) +
        (paragraphContent.length > 100 ? "..." : ""),
      createdAt: new Date().toISOString(),
      location,
      year,
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem("sermonBookmarks", JSON.stringify(updatedBookmarks));
  };

  const removeBookmark = (bookmarkId: string) => {
    const updatedBookmarks = bookmarks.filter(
      (bookmark) => bookmark.id !== bookmarkId
    );
    setBookmarks(updatedBookmarks);
    localStorage.setItem("sermonBookmarks", JSON.stringify(updatedBookmarks));
  };

  const isBookmarked = (sermonId: string, paragraphId: number): boolean => {
    return bookmarks.some(
      (bookmark) =>
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
    const existingBookmark = bookmarks.find(
      (bookmark) =>
        bookmark.sermonId === sermonId && bookmark.paragraphId === paragraphId
    );

    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
    } else {
      addBookmark(
        sermonId,
        sermonTitle,
        paragraphId,
        paragraphContent,
        location,
        year
      );
    }
  };

  const navigateToBookmark = (bookmark: Bookmark) => {
    // Find the sermon in allSermons
    const sermon = allSermons.find((s) => s.id === bookmark.sermonId);
    if (sermon) {
      setSelectedMessage(sermon);
      setActiveTab("message"); // Assuming reader is the tab for reading sermons

      // Wait for the component to render then scroll to the paragraph
      setTimeout(() => {
        const element = document.getElementById(
          `paragraph-${bookmark.paragraphId}`
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start", // Changed from 'end' to 'start' to show paragraph at top
            inline: "nearest", // Keep this for better positioning
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

  // Load sermons progressively for better performance
  useEffect(() => {
    const loadSermonsProgressively = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);
        setLoadingMessage("Loading audio sermons...");

        // First load lightweight data for quick startup
        const audioData = await loadAudioSermons();
        const audioSermons = audioData.default || audioData;

        setLoadingProgress(20);
        setLoadingMessage("Setting up initial sermons...");

        // Set initial sermons with just audio sermons for quick startup
        const initialSermons: Sermon[] = [...audioSermons];
        setAllSermons(initialSermons);
        sermonCollection = [...initialSermons];

        // Don't set random sermons from audio - wait for text sermons
        // Set a placeholder selected message from audio for now
        if (initialSermons.length > 0) {
          setSelectedMessage(initialSermons[0]);
        }

        setLoadingProgress(40);
        setLoadingMessage("Ready! Loading text sermons in background...");
        setLoading(false); // App is ready to use with audio sermons

        // Now load text sermons in background chunks
        const loadTextSermonsInBackground = async () => {
          try {
            // Load sermons in order of size (smallest first for faster perception)
            const sermonLoaders = [
              {
                loader: loadEarlySermons,
                name: "Early Sermons (1964-1969)",
                weight: 15,
              },
              { loader: loadThirdSet, name: "1971 Sermons", weight: 10 },
              { loader: loadLastSet, name: "1973 Sermons", weight: 15 },
              { loader: loadFourthSet, name: "1972 Sermons", weight: 15 },
              { loader: loadSecondSet, name: "1970 Sermons", weight: 25 }, // Largest last
            ];

            let loadedSermons: Sermon[] = [...initialSermons];
            let currentProgress = 40;
            let randomSermonsSet = false; // Track if we've set random sermons yet

            for (const { loader, name, weight } of sermonLoaders) {
              try {
                setLoadingMessage(`Loading ${name}...`);

                const data = await loader();
                const sermons = data.default || data;
                loadedSermons = [...loadedSermons, ...sermons];

                // Update sermons progressively
                setAllSermons([...loadedSermons]);
                sermonCollection = [...loadedSermons];

                // Set random sermons only once when first text sermons are loaded
                const textSermons = loadedSermons.filter(
                  (sermon) => sermon.type === "text"
                );

                if (textSermons.length > 0 && !randomSermonsSet) {
                  const allRandomSermons = textSermons
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                  setRandomSermons(allRandomSermons);

                  // Set the first random text sermon as the selected message
                  setSelectedMessage(allRandomSermons[0]);
                  randomSermonsSet = true; // Mark as set
                }

                currentProgress += weight;
                setLoadingProgress(currentProgress);

                // Small delay to prevent UI blocking
                await new Promise((resolve) => setTimeout(resolve, 10));
              } catch (error) {
                console.warn(`⚠️ Failed to load ${name}:`, error);
              }
            }

            setLoadingProgress(100);
            setLoadingMessage("All sermons loaded successfully!");

            // Clear loading message after a short delay
            setTimeout(() => {
              setLoadingMessage("");
            }, 2000);
          } catch (error) {
            console.error("❌ Error loading text sermons:", error);
          }
        };

        // Start background loading after a short delay
        setTimeout(loadTextSermonsInBackground, 100);
      } catch (err) {
        console.error("❌ Error loading initial sermons:", err);
        setError("Failed to load sermons. Please try again later.");
        setLoading(false);
      }
    };

    loadSermonsProgressively();
  }, []);

  const contextValue: SermonContextType = {
    handleClose,
    handleMaximize,
    handleMinimize,
    selectedMessage,
    allSermons,
    loading,
    loadingProgress,
    loadingMessage,
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
