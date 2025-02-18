import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

import { Song } from "@/types";

type AuthUser = {
  name: string;
  email: string;
};

type BmusicContextType = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  songRepo: string;
  setSongRepo: React.Dispatch<React.SetStateAction<string>>;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
  fetchError: string;
  setFetchError: React.Dispatch<React.SetStateAction<string>>;
  fetching: boolean;
  setfetching: React.Dispatch<React.SetStateAction<boolean>>;
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  refetch: () => void;
  selectedHymnBackground: string;
  setSelectedHymnBackground: React.Dispatch<React.SetStateAction<string>>;
  presentationImgs: string[];
  setPresentationImgs: React.Dispatch<React.SetStateAction<string[]>>;
};

const BmusicContext = createContext<BmusicContextType | undefined>(undefined);

type BmusicProviderProps = {
  children: ReactNode;
};

export const BmusicProvider = ({ children }: BmusicProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>({
    name: "John Doe",
    email: "",
  });
  const [currentScreen, setCurrentScreen] = useState("Songs");
  const [songRepo, setSongRepo] = useState("");
  const [selectedHymnBackground, setSelectedHymnBackground] = useState("");
  const [theme, setTheme] = useState("creamy");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setfetching] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [presentationImgs, setPresentationImgs] = useState<string[]>([]);

  useEffect(() => {
    const savedDirectory = localStorage.getItem("bmusicsongdir");
    const savedTheme = localStorage.getItem("bmusictheme");
    const savedPresentationBg = localStorage.getItem("bmusicpresentationbg");

    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedDirectory) {
      setSongRepo(savedDirectory);
      console.log("Saved directory:", savedDirectory);
    }

    if (savedPresentationBg) {
      setSelectedHymnBackground(savedPresentationBg);
      console.log("Saved presentation background:", savedPresentationBg);
    }
  }, []);

  // useEffect(() => {
  //   // Ensure imageRepo is defined and not empty
  //   if (!imageRepo) {
  //     console.log("Choose a directory to load images from");
  //     return;
  //   }

  //   const fetchImages = async () => {
  //     try {
  //       // Fetch images from the main process
  //       const fetchedImages = await window.api.getPresentationImages(imageRepo);

  //       // Log the fetched images to ensure we're getting the right data
  //       console.log("Fetched images:", fetchedImages);

  //       // Update state with the fetched image URLs
  //       setPresentationImgs(fetchedImages);
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         console.error("Error fetching images:", error.message);
  //       } else {
  //         console.log("An unknown error occurred while fetching images");
  //       }
  //     }
  //   };

  //   // Call the function to fetch images
  //   fetchImages();
  // }, [imageRepo]);

  useEffect(() => {
    if (!songRepo) {
      setFetchError("Choose a directory to load songs");
    }
    const fetchSongs = async () => {
      if (songRepo) {
        try {
          setfetching(true);
          const fetchedSongs = await window.api.fetchSongs(songRepo);

          // sort songs
          fetchedSongs.sort((a, b) => {
            return a.title.localeCompare(b.title);
          });
          // console.log("fetchedSongs", fetchedSongs);

          setSongs(fetchedSongs);
          // if (songs.length === 0) {
          //   setFetchError("No songs found in the selected directory");
          // }
          setfetching(false);
        } catch (error) {
          if (error instanceof Error) {
            setFetchError(error.message);
          } else {
            setFetchError("An unknown error occurred");
          }
          console.error("Failed to fetch songs:", error);
          setSongs([]);
        }
      }
    };

    fetchSongs();
  }, [songRepo]);

  const refetch = async () => {
    if (songRepo) {
      try {
        setfetching(true);
        const fetchedSongs = await window.api.fetchSongs(songRepo);

        // sort songs
        fetchedSongs.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
        // console.log("fetchedSongs", fetchedSongs);

        setSongs(fetchedSongs);
        if (songs.length === 0) {
          setFetchError("No songs found in the selected directory");
        }
        setfetching(false);
      } catch (error) {
        if (error instanceof Error) {
          setFetchError(error.message);
        } else {
          setFetchError("An unknown error occurred");
        }
        console.error("Failed to fetch songs:", error);
        setSongs([]);
      }
    }
  };

  return (
    <BmusicContext.Provider
      value={{
        user,
        setUser,
        songRepo,
        setSongRepo,
        theme,
        setTheme,
        currentScreen,
        setCurrentScreen,
        selectedSong,
        setSelectedSong,
        fetchError,
        setFetchError,
        fetching,
        setfetching,
        songs,
        setSongs,
        refetch,
        presentationImgs,
        setPresentationImgs,
        selectedHymnBackground,
        setSelectedHymnBackground,
      }}
    >
      {children}
    </BmusicContext.Provider>
  );
};

// Custom hook to use the BmusicContext
export const useBmusicContext = () => {
  const context = useContext(BmusicContext);
  if (!context) {
    throw new Error("useBmusicContext must be used within a BmusicProvider");
  }
  return context;
};
