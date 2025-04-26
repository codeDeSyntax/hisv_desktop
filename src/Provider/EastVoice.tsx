import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type EastVoiceContextType = {

  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;
  setAndSaveCurrentScreen: (arg:string) => void;
  presentationbgs: string[];
  setPresentationbgs: React.Dispatch<React.SetStateAction<string[]>>;
  bibleBgs: string[];
  setBibleBgs: React.Dispatch<React.SetStateAction<string[]>>;
  // fetchUserImages: () => void
};

const EastVoiceContext = createContext<EastVoiceContextType | undefined>(undefined);

type BmusicProviderProps = {
  children: ReactNode;
};

export const EastVoiceProvider = ({ children }: BmusicProviderProps) => {
 
  const [currentScreen, setCurrentScreen] = useState(localStorage.getItem("lastScreen") || "Home");
  const [theme, setTheme] = useState("creamy");
  const [presentationbgs , setPresentationbgs] = useState<string[]>([])
  const [userImages , setUserImages] = useState<string[]>([])
  const imagesUrl = localStorage.getItem("vmusicimages") || "";
  const [bibleBgs , setBibleBgs] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [imageError ,setImageError] = useState("")
  useEffect(() => {
    localStorage.setItem("lastScreen", currentScreen)
  },[currentScreen])

  useEffect(() => {
    const fetchImages = async () => {
      const images = await window.api.getImages(imagesUrl);
      setBibleBgs(images);
      setPresentationbgs(images)
    };

    fetchImages();
  }, [imagesUrl]);

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  const saveCurrentScreen  = (screen:string)  => {
    localStorage.setItem("lastScreen", screen)
  }
  const setAndSaveCurrentScreen  = (screen:string) => {
    setCurrentScreen(screen);
    localStorage.setItem("lastScreen", screen)
  }

  //  const fetchUserImages = useCallback(async () => {
  //     setIsLoadingImages(true);
  //     setImageError("");
  
  //     try {
  //       const imagesUrl = localStorage.getItem("vmusicimages");
  //       if (!imagesUrl) {
  //         setImageError("No image directory selected");
  //         setIsLoadingImages(false);
  //         return;
  //       }
  
  //       const imageBase64List = await window.api.getImages(imagesUrl);
  //       // if(imageBase64List){
  //       //   setSysImages(imageBase64List);
  //       // }
  //       if (!imageBase64List || imageBase64List.length === 0) {
  //         setImageError("No images found in selected directory");
  //         setIsLoadingImages(false);
  //         return;
  //       }
  
  //       // Cache the images in localStorage
  //       // localStorage.setItem("bmusicUserImages", JSON.stringify(imageBase64List));
  
  //       setUserImages(imageBase64List);
  //       setPresentationbgs(imageBase64List);
  //     } catch (error) {
  //       console.error("Error loading images:", error);
  //       setImageError("Failed to load images from directory");
  //     } finally {
  //       setIsLoadingImages(false);
  //     }
  //   }, [setPresentationbgs]);


  return (
    <EastVoiceContext.Provider
      value={{
        theme,
        setTheme,
        currentScreen,
        setCurrentScreen,
        handleClose,
        handleMaximize,
        handleMinimize,
        presentationbgs,
        setPresentationbgs,
        setAndSaveCurrentScreen,
        bibleBgs,
        setBibleBgs,
        // fetchUserImages,
      }}
    >
      {children}
    </EastVoiceContext.Provider>
  );
};

// Custom hook to use the EastVoiceContext
export const useEastVoiceContext = () => {
  const context = useContext(EastVoiceContext);
  if (!context) {
    throw new Error("useEastVoiceContext must be used within a BmusicProvider");
  }
  return context;
};
