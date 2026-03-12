// contexts/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColorState] = useState<string>("#10a37f");

  useEffect(() => {
    // Check if user has a preference stored
    const storedPreference = localStorage.getItem("darkMode");
    if (storedPreference) {
      setIsDarkMode(storedPreference === "true");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDarkMode(prefersDark);
    }
    // Load accent color
    const storedAccent = localStorage.getItem("accentColor");
    if (storedAccent) {
      setAccentColorState(storedAccent);
      document.documentElement.style.setProperty("--accent", storedAccent);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Store user preference
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    document.documentElement.style.setProperty("--accent", color);
    localStorage.setItem("accentColor", color);
  };

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleDarkMode, accentColor, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
