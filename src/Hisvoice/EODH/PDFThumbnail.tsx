import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-ignore
import PDFWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import { FileText } from "lucide-react";
import { pdfDocumentCache, thumbnailCache } from "./pdfCache";

pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorkerUrl;

const THUMBNAIL_HEIGHT = 168;

interface Props {
  filePath: string;
  /** Target render width in CSS pixels */
  targetWidth?: number;
  isDarkMode?: boolean;
}

async function loadPdfBytes(filePath: string): Promise<Uint8Array> {
  const bytes = await window.ipcRenderer.invoke("eodh:read-pdf", filePath);
  if (ArrayBuffer.isView(bytes)) {
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }
  if (Array.isArray(bytes)) {
    return new Uint8Array(bytes);
  }
  if (bytes?.type === "Buffer" && Array.isArray(bytes.data)) {
    return new Uint8Array(bytes.data);
  }
  throw new Error("Failed to load PDF bytes");
}

/**
 * Renders the first page of a PDF as a thumbnail canvas.
 * Optimized with:
 * - Thumbnail image caching (stores rendered images, not re-renders)
 * - PDF document caching (reuses loaded PDFs)
 * - Lazy loading with IntersectionObserver
 * - Efficient memory management
 */
const PDFThumbnail: React.FC<Props> = ({
  filePath,
  targetWidth = 132,
  isDarkMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [cachedImage, setCachedImage] = useState<string | null>(null);

  // Check cache on mount
  useEffect(() => {
    const cached = thumbnailCache.get(filePath);
    if (cached) {
      setCachedImage(cached);
      setStatus("done");
    }
  }, [filePath]);

  const renderThumbnail = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStatus("loading");
    let cancelled = false;

    try {
      // Try to get cached PDF document
      let doc = pdfDocumentCache.get(filePath);
      let shouldCleanup = false;

      if (!doc) {
        // Load and cache PDF
        const loadingTask = pdfjsLib.getDocument({
          data: await loadPdfBytes(filePath),
          verbosity: 0,
        });
        doc = await loadingTask.promise;
        pdfDocumentCache.set(filePath, doc);
        shouldCleanup = false; // Keep document in cache
      }

      if (cancelled) return;

      const page = await doc.getPage(1);
      if (cancelled) return;

      const naturalViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        targetWidth / naturalViewport.width,
        THUMBNAIL_HEIGHT / naturalViewport.height,
      );
      const viewport = page.getViewport({ scale });

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      await page.render(
        dpr === 1
          ? {
              canvas,
              viewport,
              background: "#ffffff",
            }
          : {
              canvas,
              viewport,
              transform: [dpr, 0, 0, dpr, 0, 0],
              background: "#ffffff",
            },
      ).promise;

      if (cancelled) return;

      // Convert canvas to image data URL and cache it
      const dataUrl = canvas.toDataURL("image/png");
      thumbnailCache.set(filePath, dataUrl);
      setCachedImage(dataUrl);
      setStatus("done");
    } catch (err) {
      if (!cancelled) {
        console.error("Thumbnail render error:", err);
        setStatus("error");
      }
    }
  }, [filePath, targetWidth]);

  // Setup IntersectionObserver for lazy loading
  useEffect(() => {
    if (cachedImage) {
      // Already cached, no need to render
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void renderThumbnail();
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }, // Start loading 50px before entering viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [renderThumbnail, cachedImage]);

  return (
    <div
      ref={containerRef}
      style={{ width: targetWidth, height: THUMBNAIL_HEIGHT }}
      className="relative overflow-hidden h-full rounded-lg flex items-center justify-center"
    >
      {/* Skeleton / loading */}
      {(status === "idle" || status === "loading") && !cachedImage && (
        <div
          className="absolute inset-0 animate-pulse rounded-lg"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.06)",
          }}
        >
          {/* Faux page lines */}
          <div className="absolute inset-x-4 top-6 space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full"
                style={{
                  width: `${60 + (i % 3) * 15}%`,
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.07)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error fallback */}
      {status === "error" && !cachedImage && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.04)",
          }}
        >
          <FileText
            size={28}
            style={{
              color: isDarkMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
            }}
          />
          <span
            className="text-[9px]"
            style={{
              color: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            }}
          >
            Preview unavailable
          </span>
        </div>
      )}

      {/* Cached image */}
      {cachedImage && (
        <img
          ref={imageRef}
          src={cachedImage}
          alt="PDF thumbnail"
          className="block h-full rounded-lg transition-opaity duration-300 flex-1"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      )}

      {/* Canvas for rendering (hidden after render) */}
      <canvas
        ref={canvasRef}
        className="block h-full rounded-lg transition-opacity duration-300 flex-1"
        style={{
          opacity: status === "done" && !cachedImage ? 1 : 0,
          maxWidth: "100%",
          maxHeight: "100%",
          position: "absolute",
        }}
      />
    </div>
  );
};

export default PDFThumbnail;
