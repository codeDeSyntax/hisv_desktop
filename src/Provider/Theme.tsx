// contexts/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useCallback,
  useState,
  ReactNode,
} from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: (origin?: { x: number; y: number }) => void;
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
      const isDark = localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (isDark) {
        return localStorage.getItem("accentColorDark") ?? "#E8C968";
      } else {
        return localStorage.getItem("accentColorLight") ?? "#A68B4C";
      }
    } catch {
      return "#A68B4C";
    }
  });

  useLayoutEffect(() => {
    const root = document.documentElement;

    // Keep theme switching cheap and deterministic.
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Align native form controls/scrollbars with the active theme.
    root.style.colorScheme = isDarkMode ? "dark" : "light";

    // Switch accent color based on mode
    const accentColorForMode = isDarkMode
      ? localStorage.getItem("accentColorDark") ?? "#E8C968"
      : localStorage.getItem("accentColorLight") ?? "#A68B4C";
    setAccentColorState(accentColorForMode);
    root.style.setProperty("--accent", accentColorForMode);

    // Store user preference
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = useCallback((origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };

    if (typeof doc.startViewTransition !== "function" || prefersReducedMotion) {
      setIsDarkMode((prev) => !prev);
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;

    root.style.setProperty("--theme-sweep-x", `${x}px`);
    root.style.setProperty("--theme-sweep-y", `${y}px`);
    root.classList.add("theme-sweep");

    try {
      const transition = doc.startViewTransition(() => {
        setIsDarkMode((prev) => !prev);
      });

      transition.finished.finally(() => {
        root.classList.remove("theme-sweep");
      });
    } catch {
      root.classList.remove("theme-sweep");
      setIsDarkMode((prev) => !prev);
    }
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    document.documentElement.style.setProperty("--accent", color);
    // Save to the appropriate mode-specific key
    const key = isDarkMode ? "accentColorDark" : "accentColorLight";
    localStorage.setItem(key, color);
  }, [isDarkMode]);

  const contextValue = useMemo(
    () => ({ isDarkMode, toggleDarkMode, accentColor, setAccentColor }),
    [isDarkMode, toggleDarkMode, accentColor, setAccentColor],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
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
