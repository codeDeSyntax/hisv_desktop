import { useEffect, useCallback } from "react";

export interface ProjectionCommand {
  type: string;
  [key: string]: any;
}

/**
 * Hook to handle projection window synchronization
 * Sends sermon updates, navigation, and UI state to the projection window
 */
export function useProjectionSync() {
  const sendToProjection = useCallback(async (command: ProjectionCommand) => {
    try {
      // Check if IPC is available
      if (!window.ipcRenderer) {
        console.warn("IPC not available");
        return false;
      }

      const result = await window.ipcRenderer.invoke(
        "send-to-projection",
        command,
      );
      return result?.success || false;
    } catch (error) {
      console.error("Error sending to projection:", error);
      return false;
    }
  }, []);

  const updateSermonData = useCallback(
    (sermon: string, title: string) => {
      return sendToProjection({
        type: "update-sermon",
        sermon,
        title,
      });
    },
    [sendToProjection],
  );

  const updateCurrentParagraph = useCallback(
    (paragraphId: number) => {
      return sendToProjection({
        type: "update-current-paragraph",
        paragraphId,
      });
    },
    [sendToProjection],
  );

  const updateSearchHighlight = useCallback(
    (paragraphId: number, searchTerm: string) => {
      return sendToProjection({
        type: "update-search-highlight",
        paragraphId,
        searchTerm,
      });
    },
    [sendToProjection],
  );

  const clearHighlight = useCallback(() => {
    return sendToProjection({
      type: "clear-highlight",
    });
  }, [sendToProjection]);

  const updateFontSize = useCallback(
    (size: number) => {
      return sendToProjection({
        type: "update-font-size",
        size,
      });
    },
    [sendToProjection],
  );

  const updateFontFamily = useCallback(
    (fontFamily: string) => {
      return sendToProjection({
        type: "update-font-family",
        fontFamily,
      });
    },
    [sendToProjection],
  );

  const goToParagraph = useCallback(
    (paragraphId: number) => {
      return sendToProjection({
        type: "go-to-paragraph",
        paragraphId,
      });
    },
    [sendToProjection],
  );

  return {
    sendToProjection,
    updateSermonData,
    updateCurrentParagraph,
    updateSearchHighlight,
    clearHighlight,
    updateFontSize,
    updateFontFamily,
    goToParagraph,
  };
}

/**
 * Hook to check projection status and create/close projection window
 */
export function useProjectionControl() {
  const checkStatus = useCallback(async () => {
    try {
      if (!window.ipcRenderer) {
        return null;
      }

      const status = await window.ipcRenderer.invoke("get-projection-status");
      return status;
    } catch (error) {
      console.error("Error checking projection status:", error);
      return null;
    }
  }, []);

  const createProjection = useCallback(async () => {
    try {
      if (!window.ipcRenderer) {
        console.warn("IPC not available");
        return false;
      }

      const result = await window.ipcRenderer.invoke("create-projection");
      return result?.success || false;
    } catch (error) {
      console.error("Error creating projection:", error);
      return false;
    }
  }, []);

  const closeProjection = useCallback(async () => {
    try {
      if (!window.ipcRenderer) {
        console.warn("IPC not available");
        return false;
      }

      const result = await window.ipcRenderer.invoke("close-projection");
      return result?.success || false;
    } catch (error) {
      console.error("Error closing projection:", error);
      return false;
    }
  }, []);

  return {
    checkStatus,
    createProjection,
    closeProjection,
  };
}
