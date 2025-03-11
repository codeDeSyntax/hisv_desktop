import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

type BibleContextType = {

  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;
  presentationbgs: string[];
  setPresentationbgs: React.Dispatch<React.SetStateAction<string[]>>;
};

const BibleContext = createContext<BibleContextType | undefined>(undefined);

type BibleProviderProps = {
  children: ReactNode;
};

export const BibleProvider = ({ children }: BibleProviderProps) => {
 
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [theme, setTheme] = useState("creamy");
  const [presentationbgs , setPresentationbgs] = useState<string[]>([])

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
        presentationbgs,
        setPresentationbgs
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
    throw new Error("useBibleContext must be used within a BmusicProvider");
  }
  return context;
};
