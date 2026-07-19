import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";

// ── types ────────────────────────────────────────────────────────────────────
export interface PDFViewerHandle {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface Props {
  filePath: string;
}

// ── component ─────────────────────────────────────────────────────────────────
const PDFViewer = forwardRef<PDFViewerHandle, Props>((props, ref) => {
  const { filePath } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── expose imperative handle ────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    goToPage: (page: number) => {
      console.log("Native viewer: navigation handled by browser");
    },
    nextPage: () => {
      console.log("Native viewer: navigation handled by browser");
    },
    prevPage: () => {
      console.log("Native viewer: navigation handled by browser");
    },
  }));

  // ── Load PDF via IPC and create blob URL ─────────────────────────────────────
  useEffect(() => {
    if (!filePath) return;

    // Prevent multiple simultaneous loads
    if (isLoading) return;

    let isMounted = true;
    let blobUrl: string | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      try {
        console.log("[PDFViewer] Loading PDF via IPC:", filePath);
        const bytes = await window.ipcRenderer.invoke("eodh:read-pdf", filePath);
        
        if (!isMounted) return;
        
        // Create blob URL
        const blob = new Blob([bytes], { type: "application/pdf" });
        blobUrl = URL.createObjectURL(blob);
        
        console.log("[PDFViewer] Created blob URL:", blobUrl);
        setObjectUrl(blobUrl);
        // Don't call onLoad here to prevent re-render loops
      } catch (err) {
        console.error("[PDFViewer] Failed to load PDF:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [filePath]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Set iframe src when objectUrl is ready ───────────────────────────────────
  useEffect(() => {
    if (objectUrl && iframeRef.current && iframeRef.current.src !== objectUrl) {
      console.log("[PDFViewer] Setting iframe src to:", objectUrl);
      iframeRef.current.src = objectUrl;
    }
  }, [objectUrl]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      style={{ backgroundColor: "#525659" }}
      title="PDF Viewer"
    />
  );
});

PDFViewer.displayName = "PDFViewer";
export default PDFViewer;
