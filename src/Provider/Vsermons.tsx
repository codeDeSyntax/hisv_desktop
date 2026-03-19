import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Sermon } from "@/types/index.js";

// ── DB IPC helpers ────────────────────────────────────────────────────────────
const ipc = window.ipcRenderer;

/** Map a raw DB row (snake_case) to the app's Sermon shape. */
function rowToSermon(row: Record<string, unknown>): Sermon {
  return {
    id: row.id as string,
    title: row.title as string,
    year: (row.year as string) ?? undefined,
    date: (row.date as string) ?? undefined,
    type: (row.type as string) ?? undefined,
    location: (row.location as string) ?? undefined,
    audioUrl: (row.audio_url as string) ?? undefined,
    downloadLink: (row.download_link as string) ?? undefined,
    sermon: (row.sermon_text as string) ?? undefined,
  };
}

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

// ── context type ──────────────────────────────────────────────────────────────
interface SermonContextType {
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;
  selectedMessage: Sermon | null;
  allSermons: Sermon[];
  loading: boolean;
  loadingProgress: number;
  loadingMessage: string;
  /** "checking" | "missing" | "downloading" | "ready" | "error" */
  dbStatus: string;
  downloadProgress: number;
  error: string | null;
  startDbDownload: () => Promise<void>;
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
  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  // Bookmark functions
  bookmarks: Bookmark[];
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (
    sermonId: string,
    sermonTitle: string,
    paragraphId: number,
    paragraphContent: string,
    location?: string,
    year?: string,
  ) => void;
  removeBookmark: (bookmarkId: string) => void;
  isBookmarked: (sermonId: string, paragraphId: number) => boolean;
  toggleBookmark: (
    sermonId: string,
    sermonTitle: string,
    paragraphId: number,
    paragraphContent: string,
    location?: string,
    year?: string,
  ) => void;
  navigateToBookmark: (bookmark: Bookmark) => void;
  // Search navigation
  pendingSearchNav: SearchNavigation | null;
  setPendingSearchNav: (nav: SearchNavigation | null) => void;
  navigateToSearchResult: (
    sermonId: string | number,
    paragraphId: number,
    searchTerm: string,
  ) => void;
}

// Create the context with an initial undefined value
const SermonContext = createContext<SermonContextType | undefined>(undefined);

// Define props for the provider component
interface SermonProviderProps {
  children: ReactNode;
}

const SermonProvider = ({ children }: SermonProviderProps) => {
  const initRanRef = useRef(false);
  const [selectedMessage, setSelectedMessage] = useState<Sermon | null>(null);
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] =
    useState<string>("Starting up...");
  const [dbStatus, setDbStatus] = useState<string>("checking");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [randomSermons, setRandomSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [CB, setCB] = useState<number>(0);
  const [prevScreen, setPrevScreen] = useState(activeTab);
  const [pendingSearchNav, setPendingSearchNav] =
    useState<SearchNavigation | null>(null);
  const [theme, setTheme] = useState(
    localStorage.getItem("vsermontheme") || "light",
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

  // Get last read sermon from localStorage
  const getLastReadSermon = (): Sermon | null => {
    const saved = localStorage.getItem("lastReadSermon");
    return saved ? JSON.parse(saved) : null;
  };

  // Get first sermon from recent history if it exists in the loaded set
  const getFirstRecentSermon = (loaded: Sermon[]): Sermon | null => {
    try {
      const json = localStorage.getItem("recentSermons");
      if (!json) return null;
      const list = JSON.parse(json) as Sermon[];
      if (!list.length) return null;
      return loaded.find((s) => s.id === list[0].id) ?? null;
    } catch {
      return null;
    }
  };

  // Generate three random text sermons
  const getThreeRandomSermons = useCallback((): Sermon[] => {
    const textSermons = allSermons.filter((s) => s.type === "text");
    const set = new Set<Sermon>();
    while (set.size < 3 && set.size < textSermons.length) {
      set.add(textSermons[Math.floor(Math.random() * textSermons.length)]);
    }
    return Array.from(set);
  }, [allSermons]);

  // ── Auto-fetch full sermon text when a text sermon without text is selected ──
  useEffect(() => {
    if (
      selectedMessage &&
      selectedMessage.type === "text" &&
      !selectedMessage.sermon
    ) {
      ipc
        .invoke("db:get-sermon", selectedMessage.id)
        .then((row: Record<string, unknown> | null) => {
          if (row) setSelectedMessage(rowToSermon(row));
        })
        .catch(console.error);
    }
  }, [selectedMessage?.id, selectedMessage?.type, !selectedMessage?.sermon]);

  // ── Listen for download-progress events from the main process ───────────────
  useEffect(() => {
    const handler = (_event: unknown, progress: number) => {
      setDownloadProgress(progress);
      setLoadingProgress(progress);
      setLoadingMessage(`Downloading sermon database… ${progress}%`);
    };
    ipc.on("db:download-progress", handler);
    return () => {
      ipc.off("db:download-progress", handler);
    };
  }, []);

  // ── DB-based sermon loading ─────────────────────────────────────────────────
  const loadSermonsFromDb = useCallback(async () => {
    setDbStatus("ready");
    setLoadingMessage("Loading sermons…");
    setLoadingProgress(10);

    const rows: Record<string, unknown>[] = await ipc.invoke("db:get-sermons");
    const loaded: Sermon[] = rows.map(rowToSermon);

    setAllSermons(loaded);
    setLoadingProgress(80);
    setLoadingMessage("Almost ready…");

    const textSermons = loaded.filter((s) => s.type === "text");

    if (textSermons.length > 0) {
      const threeRandom = textSermons
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setRandomSermons(threeRandom);

      let toOpen = getFirstRecentSermon(loaded) ?? getLastReadSermon();

      if (toOpen) {
        toOpen = loaded.find((s) => s.id === toOpen!.id) ?? null;
      }

      setSelectedMessage(toOpen ?? threeRandom[0] ?? null);
    }

    setLoadingProgress(100);
    setLoading(false);
    setLoadingMessage("Ready!");
  }, [setSelectedMessage]);

  const startDbDownload = useCallback(async () => {
    try {
      setError(null);
      setDbStatus("downloading");
      setLoadingMessage("Getting your sermon library ready…");
      setDownloadProgress(0);

      const result = await ipc.invoke("db:download");

      if (!result.success) {
        throw new Error(result.error ?? "Download failed");
      }

      setDownloadProgress(100);
      setLoadingProgress(100);
      setLoadingMessage("Library downloaded. Finalizing…");
      await new Promise((r) => setTimeout(r, 250));

      setLoading(true);
      await loadSermonsFromDb();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("db:download flow error:", msg);
      setError("We couldn't download the sermon library. Please try again.");
      setDbStatus("missing");
      setLoading(false);
    }
  }, [loadSermonsFromDb]);

  useEffect(() => {
    if (initRanRef.current) return;
    initRanRef.current = true;

    const init = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);
        setLoadingMessage("Checking sermon database\u2026");
        setDbStatus("checking");
        setError(null);

        const status = await ipc.invoke("db:status");

        // ── First launch or missing DB: show blocking overlay and let user trigger download ──
        if (!status.exists) {
          setDbStatus("missing");
          setLoadingMessage("Sermon library required");
          setDownloadProgress(0);
          setLoading(false);
          return;
        }

        await loadSermonsFromDb();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Sermon init error:", msg);
        setError(
          "We couldn't prepare your sermon library. Please restart and try again.",
        );
        setDbStatus("error");
        setLoading(false);
      }
    };

    init();
  }, [loadSermonsFromDb]);

  // ── Search navigation ──────────────────────────────────────────────────────
  const navigateToSearchResult = (
    sermonId: string | number,
    paragraphId: number,
    searchTerm: string,
  ) => {
    const targetSermon = allSermons.find((s) => s.id === sermonId);
    if (targetSermon) {
      // If this sermon is already selected and has text loaded, keep the text
      // instead of overwriting with the metadata-only version from allSermons.
      const alreadyLoaded =
        selectedMessage?.id === sermonId && selectedMessage?.sermon;

      if (!alreadyLoaded) {
        setSelectedMessage(targetSermon);
      }

      setSearchQuery(searchTerm);
      setPendingSearchNav({
        targetSermonId: sermonId,
        targetParagraphId: paragraphId,
        searchTerm: searchTerm,
      });
      setActiveTab("message");
    }
  };

  // ── Bookmark functions ─────────────────────────────────────────────────────
  const addBookmark = (
    sermonId: string,
    sermonTitle: string,
    paragraphId: number,
    paragraphContent: string,
    location?: string,
    year?: string,
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
      (bookmark) => bookmark.id !== bookmarkId,
    );
    setBookmarks(updatedBookmarks);
    localStorage.setItem("sermonBookmarks", JSON.stringify(updatedBookmarks));
  };

  const isBookmarked = (sermonId: string, paragraphId: number): boolean => {
    return bookmarks.some(
      (bookmark) =>
        bookmark.sermonId === sermonId && bookmark.paragraphId === paragraphId,
    );
  };

  const toggleBookmark = (
    sermonId: string,
    sermonTitle: string,
    paragraphId: number,
    paragraphContent: string,
    location?: string,
    year?: string,
  ) => {
    const existingBookmark = bookmarks.find(
      (bookmark) =>
        bookmark.sermonId === sermonId && bookmark.paragraphId === paragraphId,
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
        year,
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
          `paragraph-${bookmark.paragraphId}`,
        );

        if (element) {
          // Find the scroll container (the overflow-y-auto parent)
          const scrollContainer = element.closest(".overflow-y-auto");

          if (scrollContainer) {
            // Calculate position relative to scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const scrollTop = scrollContainer.scrollTop;
            const elementRelativeTop = elementRect.top - containerRect.top;
            const centerOffset =
              (containerRect.height - elementRect.height) / 2;
            const targetScroll = scrollTop + elementRelativeTop - centerOffset;

            // Smooth scroll within the container
            scrollContainer.scrollTo({
              top: targetScroll,
              behavior: "smooth",
            });
          }
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

  const contextValue: SermonContextType = useMemo(
    () => ({
      handleClose,
      handleMaximize,
      handleMinimize,
      selectedMessage,
      allSermons,
      loading,
      loadingProgress,
      loadingMessage,
      dbStatus,
      downloadProgress,
      error,
      startDbDownload,
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
      isPresentationMode,
      setIsPresentationMode,
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
    }),
    [
      handleClose,
      handleMaximize,
      handleMinimize,
      selectedMessage,
      allSermons,
      loading,
      loadingProgress,
      loadingMessage,
      dbStatus,
      downloadProgress,
      error,
      startDbDownload,
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
      isPresentationMode,
      setIsPresentationMode,
      theme,
      setTheme,
      bookmarks,
      setBookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      toggleBookmark,
      navigateToBookmark,
      pendingSearchNav,
      setPendingSearchNav,
      navigateToSearchResult,
    ],
  );

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
