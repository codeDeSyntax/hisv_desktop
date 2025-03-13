import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

// Define types for our Bible data
export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  testament: string;
  chapters: Chapter[];
}

export interface BibleTranslation {
  translation: string;
  books: Book[];
}

type BibleContextType = {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;

  // Bible specific state
  sidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  activeFeature: string | null;
  setActiveFeature: React.Dispatch<React.SetStateAction<string | null>>;
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Bible content state
  bibleData: { [key: string]: BibleTranslation };
  currentTranslation: string;
  setCurrentTranslation: React.Dispatch<React.SetStateAction<string>>;
  currentBook: string;
  setCurrentBook: React.Dispatch<React.SetStateAction<string>>;
  currentChapter: number;
  setCurrentChapter: React.Dispatch<React.SetStateAction<number>>;
  bookList: Book[];

  // User preferences
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  verseTextColor: string;
  setVerseTextColor: React.Dispatch<React.SetStateAction<string>>;

  // Bookmarks
  bookmarks: string[];
  addBookmark: (bookmark: string) => void;
  removeBookmark: (bookmark: string) => void;

  // History
  history: { reference: string; timestamp: number }[];
  addToHistory: (reference: string) => void;

  // Search
  searchResults: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  performSearch: (term: string) => void;
  exactMatch: boolean;
  setExactMatch: React.Dispatch<React.SetStateAction<boolean>>;
  wholeWords: boolean;
  setWholeWords: React.Dispatch<React.SetStateAction<boolean>>;

  // Scripture content utility functions
  getCurrentChapterVerses: () => Verse[];
  getBookChapterCount: (book: string) => number;
};

const BibleContext = createContext<BibleContextType | undefined>(undefined);

type BibleProviderProps = {
  children: ReactNode;
};

// Old and New Testament books
const oldTestamentBooks: Book[] = [
  {
    name: "Genesis",
    chapters: [],
    testament: "old",
  },
  {
    name: "Exodus",
    chapters: [],
    testament: "old",
  },
  {
    name: "Leviticus",
    chapters: [],
    testament: "old",
  },
  // Add all Old Testament books
  {
    name: "Malachi",
    chapters: [],
    testament: "old",
  },
];

const newTestamentBooks: Book[] = [
  {
    name: "Matthew",
    chapters: [],
    testament: "old",
  },
  {
    name: "Mark",
    chapters: [],
    testament: "old",
  },
  {
    name: "Luke",
    chapters: [],
    testament: "old",
  },
  // Add all New Testament books
  {
    name: "Revelation",
    chapters: [],
    testament: "old",
  },
];

// Combined list with testament property
const allBooks: Book[] = [...oldTestamentBooks, ...newTestamentBooks];

export const BibleProvider = ({ children }: BibleProviderProps) => {
  // App state
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bibleTheme") || "light";
  });

  // UI state
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    return localStorage.getItem("bibleSidebarExpanded") !== "false";
  });
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Bible content state
  const [bibleData, setBibleData] = useState<{
    [key: string]: BibleTranslation;
  }>({});
  const [currentTranslation, setCurrentTranslation] = useState(() => {
    return localStorage.getItem("bibleCurrentTranslation") || "KJV";
  });
  const [currentBook, setCurrentBook] = useState(() => {
    return localStorage.getItem("bibleCurrentBook") || "1 Timothy";
  });
  const [currentChapter, setCurrentChapter] = useState(() => {
    return parseInt(localStorage.getItem("bibleCurrentChapter") || "3");
  });
  const [bookList, setBookList] = useState<Book[]>(allBooks);

  // User preferences
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("bibleFontSize") || "medium";
  });
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem("bibleFontFamily") || "serif";
  });
  const [verseTextColor, setVerseTextColor] = useState(() => {
    return localStorage.getItem("bibleVerseTextColor") || "#000000";
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bibleBookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // History
  const [history, setHistory] = useState<
    { reference: string; timestamp: number }[]
  >(() => {
    try {
      const saved = localStorage.getItem("bibleHistory");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Search
  const [searchResults, setSearchResults] = useState<
    { book: string; chapter: number; verse: number; text: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exactMatch, setExactMatch] = useState(false);
  const [wholeWords, setWholeWords] = useState(false);

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem("bibleTheme", theme);
    localStorage.setItem("bibleSidebarExpanded", String(sidebarExpanded));
    localStorage.setItem("bibleCurrentTranslation", currentTranslation);
    localStorage.setItem("bibleCurrentBook", currentBook);
    localStorage.setItem("bibleCurrentChapter", String(currentChapter));
    localStorage.setItem("bibleFontSize", fontSize);
    localStorage.setItem("bibleFontFamily", fontFamily);
    localStorage.setItem("bibleVerseTextColor", verseTextColor);
    localStorage.setItem("bibleBookmarks", JSON.stringify(bookmarks));
    localStorage.setItem("bibleHistory", JSON.stringify(history));
  }, [
    theme,
    sidebarExpanded,
    currentTranslation,
    currentBook,
    currentChapter,
    fontSize,
    fontFamily,
    verseTextColor,
    bookmarks,
    history,
  ]);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Fetch Bible data
  useEffect(() => {
    const fetchBibleData = async () => {
      try {
        // In a real app, you would fetch from actual JSON files
        const englishResponse = await fetch("./assets/newkjv.json");
        const twiResponse = await fetch("./assets/twijson.json");
  
        const englishData = await englishResponse.json();
        const twiData = await twiResponse.json();
  
        const fetchedBibleData = {
          KJV: englishData,
          TWI: twiData,
        };
  
        setBibleData(fetchedBibleData);
  
        // Update bookList based on the current translation and remove duplicates
        const books = currentTranslation === "KJV" ? fetchedBibleData.KJV.books : fetchedBibleData.TWI.books;
        const uniqueBooks = Array.from(new Set(books.map((book: Book) => book.name)))
          .map(name => books.find((book: Book) => book.name === name));
  
        setBookList(uniqueBooks);
      } catch (error) {
        console.error("Error fetching Bible data:", error);
        // Use mock data for development
        // const mockData = {
        //   KJV: {
        //     translation: "King James Version",
        //     books: [
        //       {
        //         name: "1 Timothy",
        //         testament: "new",
        //         chapters: [
        //           { chapter: 1, verses: [] },
        //           { chapter: 2, verses: [] },
        //           {
        //             chapter: 3,
        //             verses: [
        //               {
        //                 verse: 1,
        //                 text: "This is a true saying, If a man desire the office of a bishop, he desireth a good work.",
        //               },
        //               {
        //                 verse: 2,
        //                 text: "A bishop then must be blameless, the husband of one wife, vigilant, sober, of good behaviour, given to hospitality, apt to teach;",
        //               },
        //               {
        //                 verse: 3,
        //                 text: "Not given to wine, no striker, not greedy of filthy lucre; but patient, not a brawler, not covetous;",
        //               },
        //               {
        //                 verse: 4,
        //                 text: "One that ruleth well his own house, having his children in subjection with all gravity;",
        //               },
        //               {
        //                 verse: 5,
        //                 text: "(For if a man know not how to rule his own house, how shall he take care of the church of God?)",
        //               },
        //               {
        //                 verse: 6,
        //                 text: "Not a novice, lest being lifted up with pride he fall into the condemnation of the devil.",
        //               },
        //               {
        //                 verse: 7,
        //                 text: "Moreover he must have a good report of them which are without; lest he fall into reproach and the snare of the devil.",
        //               },
        //               {
        //                 verse: 8,
        //                 text: "Likewise must the deacons be grave, not doubletongued, not given to much wine, not greedy of filthy lucre;",
        //               },
        //               {
        //                 verse: 9,
        //                 text: "Holding the mystery of the faith in a pure conscience.",
        //               },
        //               {
        //                 verse: 10,
        //                 text: "And let these also first be proved; then let them use the office of a deacon, being found blameless.",
        //               },
        //               {
        //                 verse: 11,
        //                 text: "Even so must their wives be grave, not slanderers, sober, faithful in all things.",
        //               },
        //               {
        //                 verse: 12,
        //                 text: "Let the deacons be the husbands of one wife, ruling their children and their own houses well.",
        //               },
        //               {
        //                 verse: 13,
        //                 text: "For they that have used the office of a deacon well purchase to themselves a good degree, and great boldness in the faith which is in Christ Jesus.",
        //               },
        //               {
        //                 verse: 14,
        //                 text: "These things write I unto thee, hoping to come unto thee shortly:",
        //               },
        //               {
        //                 verse: 15,
        //                 text: "But if I tarry long, that thou mayest know how thou oughtest to behave thyself in the house of God, which is the church of the living God, the pillar and ground of the truth.",
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //     ],
        //   },
        //   TWI: {
        //     translation: "Twi",
        //     books: [
        //       {
        //         name: "1 Timoteo",
        //         testament: "new",
        //         chapters: [
        //           { chapter: 1, verses: [] },
        //           { chapter: 2, verses: [] },
        //           {
        //             chapter: 3,
        //             verses: [
        //               {
        //                 verse: 1,
        //                 text: "Sɛ obi pɛ asɔfo panyin adwuma a, ɔpɛ adwuma pa.",
        //               },
        //               {
        //                 verse: 2,
        //                 text: "Ɛsɛ sɛ ɔsɔfo panyin yɛ onipa a mfomso biara nni ne ho, ɔyɛ ɔbaa koro kunu a n'ani da hɔ, ɔwɔ ahohyɛso, ɔdwenkyerɛw pa a ɔwɔ anuonyam, ɔhwɛ ahɔho yiye, na obetumi akyerɛkyerɛ.",
        //               },
        //               {
        //                 verse: 3,
        //                 text: "Ɛnsɛ sɛ ɔyɛ ɔkɔwensani, ɔkofoni, na mmom, ɔyɛ odwo a ɔmpɛ ntɔkwaw, na ɔmpɛ sika.",
        //               },
        //               {
        //                 verse: 4,
        //                 text: "Ɛsɛ sɛ ɔhwɛ ɔno ara ne fifo yiye, ma ne mma di n'asɛm pɛpɛɛpɛ.",
        //               },
        //               {
        //                 verse: 5,
        //                 text: "Sɛ obi ntumi nhwɛ ɔno ara ne fi yiye a, ɔbɛyɛ dɛn ahwɛ Onyankopɔn asafo?",
        //               },
        //               {
        //                 verse: 6,
        //                 text: "Ɛnsɛ sɛ ɔyɛ obi a ɔnsɔɔ nye gyidini, anyɛ saa a, ɔbɛyɛ ahantan na wɔabu no fɔ sɛnea wobuu ɔbonsam fɔ no.",
        //               },
        //               {
        //                 verse: 7,
        //                 text: "Bio, ɛsɛ sɛ wɔn a wɔnye gyidifo no ka ne ho asɛmpa, sɛnea ɛbɛyɛ a, wɔrenhyɛ no aniwu, na ɔrenkɔtɔ ɔbonsam afidie mu.",
        //               },
        //               {
        //                 verse: 8,
        //                 text: "Saa ara na ɛsɛ sɛ asɔfo a wɔsom wɔ asafo no mu no yɛ nnipa a wɔwɔ anuonyam a wɔyɛ anokwafo, wɔnnom nsa bebree na wɔmpɛ ahonya kɛkɛ.",
        //               },
        //               {
        //                 verse: 9,
        //                 text: "Ɛsɛ sɛ wɔde adwenkyerɛw pa kura gyidi mu nokware a wɔada no adi no mu.",
        //               },
        //               {
        //                 verse: 10,
        //                 text: "Wonni kan nsɔ wɔn nhwɛ, na sɛ wonnya mfomso biara a, wɔnsom sɛ asɔfo wɔ asafo mu.",
        //               },
        //               {
        //                 verse: 11,
        //                 text: "Saa ara na ɛsɛ sɛ wɔn yerenom yɛ anuonyamfo a wɔnkasaboɔ, wɔwɔ ahohyɛso na wɔyɛ nokwafo wɔ ade nyinaa mu.",
        //               },
        //               {
        //                 verse: 12,
        //                 text: "Ɛsɛ sɛ asɔfo a wɔsom wɔ asafo mu no yɛ mmarima a wɔware mmaa baako na wɔhwɛ wɔn mma ne wɔn fifo yiye.",
        //               },
        //               {
        //                 verse: 13,
        //                 text: "Na wɔn a wɔsom wɔ asafo mu yiye no benya dibea pa ne akokoɔduru a ɛfata gyidi a wɔwɔ wɔ Kristo Yesu mu no.",
        //               },
        //               {
        //                 verse: 14,
        //                 text: "Merebɛba wo nkyɛn nnansa yi ara na merekyerɛw saa akwankyerɛ yi abrɛ wo.",
        //               },
        //               {
        //                 verse: 15,
        //                 text: "Na sɛ mikyɛ a, wobɛhu sɛnea ɛsɛ sɛ nnipa di wɔn ho wɔ Onyankopɔn a ɔte ase no fi a ɛyɛ asafo a ɛyɛ nokware dum ne ne nnyinaso mu no.",
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //     ],
        //   },
        // };
  
        // setBibleData(mockData);
        // setBookList(mockData[currentTranslation as keyof typeof mockData].books);
      }
    };
  
    fetchBibleData();
  }, [currentTranslation]);

  // Add a new bookmark
  const addBookmark = (bookmark: string) => {
    if (!bookmarks.includes(bookmark)) {
      setBookmarks([...bookmarks, bookmark]);
    }
  };

  // Remove a bookmark
  const removeBookmark = (bookmark: string) => {
    setBookmarks(bookmarks.filter((b) => b !== bookmark));
  };

  // Add to history
  const addToHistory = (reference: string) => {
    const newEntry = { reference, timestamp: Date.now() };
    setHistory((prevHistory) => [newEntry, ...prevHistory.slice(0, 19)]); // Keep last 20 items
  };

  // Search function
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results: {
      book: string;
      chapter: number;
      verse: number;
      text: string;
    }[] = [];

    // Simple search implementation
    Object.values(bibleData).forEach((translation) => {
      if (translation.translation === currentTranslation) {
        translation.books.forEach((book) => {
          book.chapters.forEach((chapter) => {
            chapter.verses.forEach((verse) => {
              let match = false;
              if (exactMatch) {
                match = wholeWords
                  ? new RegExp(`\\b${term}\\b`, "i").test(verse.text)
                  : verse.text.toLowerCase().includes(term.toLowerCase());
              } else {
                match = wholeWords
                  ? verse.text
                      .toLowerCase()
                      .split(/\s+/)
                      .some((word) => word === term.toLowerCase())
                  : verse.text.toLowerCase().includes(term.toLowerCase());
              }

              if (match) {
                results.push({
                  book: book.name,
                  chapter: chapter.chapter,
                  verse: verse.verse,
                  text: verse.text,
                });
              }
            });
          });
        });
      }
    });

    setSearchResults(results);
  };

  // Get current chapter verses
  const getCurrentChapterVerses = (): Verse[] => {
    try {
      const bookData = bibleData[currentTranslation]?.books.find(
        (b: Book) => b.name === currentBook
      );
      const chapterData = bookData?.chapters.find(
        (c: Chapter) => c.chapter === currentChapter
      );
      return chapterData?.verses || [];
    } catch (error) {
      console.error("Error getting verses:", error);
      return [];
    }
  };

  // Get chapter count for a book
  const getBookChapterCount = (book: string): number => {
    try {
      const bookData = bibleData[currentTranslation]?.books.find(
        (b: Book) => b.name === book
      );
      return bookData?.chapters.length || 0;
    } catch (error) {
      console.error("Error getting chapter count:", error);
      return 0;
    }
  };

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  return (
    <BibleContext.Provider
      value={{
        theme,
        setTheme,
        currentScreen,
        setCurrentScreen,
        handleClose,
        handleMaximize,
        handleMinimize,

        // UI state
        sidebarExpanded,
        setSidebarExpanded,
        activeFeature,
        setActiveFeature,
        searchOpen,
        setSearchOpen,

        // Bible content state
        bibleData,
        currentTranslation,
        setCurrentTranslation,
        currentBook,
        setCurrentBook,
        currentChapter,
        setCurrentChapter,
        bookList,

        // User preferences
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        verseTextColor,
        setVerseTextColor,

        // Bookmarks
        bookmarks,
        addBookmark,
        removeBookmark,

        // History
        history,
        addToHistory,

        // Search
        searchResults,
        searchTerm,
        setSearchTerm,
        performSearch,
        exactMatch,
        setExactMatch,
        wholeWords,
        setWholeWords,

        // Utility functions
        getCurrentChapterVerses,
        getBookChapterCount,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

// Custom hook to use the BibleContext
export const useBibleContext = () => {
  const context = useContext(BibleContext);
  if (!context) {
    throw new Error("useBibleContext must be used within a BibleProvider");
  }
  return context;
};
