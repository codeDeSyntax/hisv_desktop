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

// Define settings type
interface SermonSettings {
  fontFamily: string;
  fontStyle: string;
  fontSize: string;
  fontWeight: string;
}

// Define the context value type
interface SermonContextType {
  selectedMessage: Sermon | null;
  allSermons: Sermon[];
  loading: boolean;
  error: string | null;
  recentSermons: Sermon[];
  setRecentSermons: (sermons: Sermon[]) => void;
  setSelectedMessage: (sermon: Sermon | null) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [randomSermons, setRandomSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [CB, setCB] = useState<number>(0);
  const [theme, setTheme] = useState(
    localStorage.getItem("vsermontheme") || "light"
  );
  const [settings, setSettings] = useState<SermonSettings>({
    fontFamily: "cursive",
    fontStyle: "normal",
    fontSize: "20",
    fontWeight: "normal",
  });

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

  // Get recently opened sermons
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
    selectedMessage,
    allSermons,
    loading,
    error,
    recentSermons,
    setRecentSermons,
    setSelectedMessage,
    setActiveTab,
    activeTab,
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
