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
  // Read synchronously so the initial render already has the correct theme —
  // no useEffect needed, which eliminates the flash-of-wrong-theme on load.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return stored === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  const [accentColor, setAccentColorState] = useState<string>(() => {
    try {
      return localStorage.getItem("accentColor") ?? "#10a37f";
    } catch {
      return "#10a37f";
    }
  });

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
    // Apply a transitioning class so CSS can animate all color changes smoothly
    document.documentElement.classList.add("theme-transitioning");
    setIsDarkMode((prev) => !prev);
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
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
