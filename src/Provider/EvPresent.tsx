// contexts/PresentationContext.tsx

import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Presentation,  EvSermon,EvOther } from "@/types";

type PresentationContextType = {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  isLoading: boolean;
  createPresentation: (presentation: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePresentation: (id: string, presentation: Partial<Presentation>) => Promise<void>;
  deletePresentation: (id: string) => Promise<void>;
  setCurrentPresentation: (presentation: Presentation | null) => void;
  isPresentationMode: boolean;
  startPresentation: () => void;
  stopPresentation: () => void;
};

const EvPresentationContext = createContext<PresentationContextType | undefined>(undefined);

type EvPresenterProps = {
  children: ReactNode;
};

export const EvPresentationProvider = ({ children }: EvPresenterProps) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.loadEvPresentations();
      setPresentations(result);
    } catch (error) {
      console.error("Failed to load presentations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPresentation = async (presentation: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newPresentation = await window.api.createEvPresentation(presentation);
      setPresentations(prev => [...prev, newPresentation]);
    } catch (error) {
      console.error("Failed to create presentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePresentation = async (id: string, presentation: Partial<Presentation>) => {
    setIsLoading(true);
    try {
      const updatedPresentation = await window.api.updateEvPresentation(id, presentation);
      setPresentations(prev => 
        prev.map(p => p.id === id ? updatedPresentation : p)
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
      setPresentations(prev => prev.filter(p => p.id !== id));
      
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
        stopPresentation
      }}
    >
      {children}
    </EvPresentationContext.Provider>
  );
};

export const useEvPresentationContext = () => {
  const context = useContext(EvPresentationContext);
  if (!context) {
    throw new Error("usePresentationContext must be used within a EvPresentationProvider");
  }
  return context;
};