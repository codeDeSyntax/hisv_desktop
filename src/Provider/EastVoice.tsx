import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
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
};

const EastVoiceContext = createContext<EastVoiceContextType | undefined>(undefined);

type BmusicProviderProps = {
  children: ReactNode;
};

export const EastVoiceProvider = ({ children }: BmusicProviderProps) => {
 
  const [currentScreen, setCurrentScreen] = useState(localStorage.getItem("lastScreen") || "Home");
  const [theme, setTheme] = useState("creamy");
  const [presentationbgs , setPresentationbgs] = useState<string[]>([])
  
  useEffect(() => {
    // const previousScreen = 
  })

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
