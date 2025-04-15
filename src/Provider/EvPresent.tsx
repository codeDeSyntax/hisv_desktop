// contexts/PresentationContext.tsx

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { Presentation, EvSermon, EvOther } from "@/types";

type PresentationContextType = {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  isLoading: boolean;
  createPresentation: (
    path: string,
    presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updatePresentation: (
    id: string,
    directoryPath:string,
    presentation: Partial<Presentation>
  ) => Promise<void>;
  deletePresentation: (id: string) => Promise<void>;
  setCurrentPresentation: (presentation: Presentation | null) => void;
  isPresentationMode: boolean;
  startPresentation: () => void;
  stopPresentation: () => void;
  selectedPath: string;
  setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
  loadPresentations: () => Promise<void>;
};

const EvPresentationContext = createContext<
  PresentationContextType | undefined
>(undefined);

type EvPresenterProps = {
  children: ReactNode;
};

export const EvPresentationProvider = ({ children }: EvPresenterProps) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentPresentation, setCurrentPresentation] =
    useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>("");

  useEffect(() => {
    const storedPath = localStorage.getItem("evpresenterfilespath");
    if (storedPath) {
      console.log("Loaded path from storage:", storedPath);
      setSelectedPath(storedPath);
    }
  }, []);

  // Only load presentations when the path changes and is not empty
  useEffect(() => {
    if (selectedPath) {
      loadPresentations();
    }
  }, [selectedPath]);

  const loadPresentations = async () => {
    // Only proceed if we have a valid path
    if (!selectedPath) {
      console.log("No path selected, skipping presentation loading");
      return;
    }

    setIsLoading(true);
    console.log("Loading presentations from path:", selectedPath);

    try {
      const result = await window.api.loadEvPresentations(selectedPath);
      setPresentations(result);
      console.log("Loaded presentations:", result.length);
    } catch (error) {
      console.error("Failed to load presentations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPresentation = async (
    path: string,
    presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
  ) => {
    setIsLoading(true);
    try {
      const newPresentation = await window.api.createEvPresentation(
        path,
        presentation
      );
      setPresentations((prev) => [...prev, newPresentation]);
    } catch (error) {
      console.error("Failed to create presentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePresentation = async (
    id: string,
    selectedPath: string,
    presentation: Partial<Presentation>
  ) => {
    setIsLoading(true);
    try {
      const updatedPresentation = await window.api.updateEvPresentation(
        selectedPath,
        id,
        presentation
      );
      setPresentations((prev) =>
        prev.map((p) => (p.id === id ? updatedPresentation : p))
      );

      if (currentPresentation?.id === id) {
        setCurrentPresentation(updatedPresentation);
      }
    } catch (error) {
      console.error("Failed to update presentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePresentation = async (id: string) => {
    setIsLoading(true);
    try {
      await window.api.deleteEvPresentation(id);
      setPresentations((prev) => prev.filter((p) => p.id !== id));

      if (currentPresentation?.id === id) {
        setCurrentPresentation(null);
      }
    } catch (error) {
      console.error("Failed to delete presentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPresentation = () => {
    setIsPresentationMode(true);
  };

  const stopPresentation = () => {
    setIsPresentationMode(false);
  };

  // Effect to save the selected path to localStorage whenever it changes
  useEffect(() => {
    if (selectedPath) {
      localStorage.setItem("evpresenterfilespath", selectedPath);
    }
  }, [selectedPath]);

  return (
    <EvPresentationContext.Provider
      value={{
        presentations,
        currentPresentation,
        isLoading,
        createPresentation,
        updatePresentation,
        deletePresentation,
        setCurrentPresentation,
        isPresentationMode,
        startPresentation,
        stopPresentation,
        selectedPath,
        setSelectedPath,
        loadPresentations,
      }}
    >
      {children}
    </EvPresentationContext.Provider>
  );
};

export const useEvPresentationContext = () => {
  const context = useContext(EvPresentationContext);
  if (!context) {
    throw new Error(
      "usePresentationContext must be used within a EvPresentationProvider"
    );
  }
  return context;
};
