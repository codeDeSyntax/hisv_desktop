import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-ignore – ?url import resolved by Vite
import PDFWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { AlertCircle } from "lucide-react";
import { pdfDocumentCache } from "./pdfCache";
import { useSermonContext } from "@/Provider/Vsermons";

// Use the same worker as PDFThumbnail (singleton safe — same URL)
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorkerUrl;

// ── types ────────────────────────────────────────────────────────────────────
export interface PDFViewerHandle {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface Props {
  filePath: string;
  scale: number;
  currentPage: number;
  searchQuery: string;
  accentColor: string;
  isDarkMode: boolean;
  onLoad: (totalPages: number) => void;
  onPageChange: (page: number) => void;
  onSearchResults: (matchPages: number[], total: number) => void;
}

// ── IPC byte loader — same as PDFThumbnail ──────────────────────────────────
async function loadPdfBytes(filePath: string): Promise<Uint8Array> {
  const bytes = await window.ipcRenderer.invoke("eodh:read-pdf", filePath);
  if (ArrayBuffer.isView(bytes))
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes);
  if (Array.isArray(bytes)) return new Uint8Array(bytes);
  if (bytes?.type === "Buffer" && Array.isArray(bytes.data))
    return new Uint8Array(bytes.data);
  throw new Error("Unrecognized PDF byte format from IPC");
}

interface TextItemDetail {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

interface RebuiltParagraph {
  isHeading: boolean;
  isCentered: boolean;
  lines: TextItemDetail[][];
}

// ── Detect bold/italic from font family name ─────────────────────────────────
function detectFontStyle(styles: Record<string, any>, fontName: string) {
  const family: string = styles?.[fontName]?.fontFamily ?? "";
  const name = family.replace(/^[A-Za-z]{6}\+/, "").toLowerCase();
  return {
    isBold:
      name.includes("bold") ||
      name.includes("-bd") ||
      name.endsWith("bd") ||
      name.includes("heavy") ||
      name.includes("black"),
    isItalic:
      name.includes("italic") ||
      name.includes("oblique") ||
      name.includes("-it") ||
      name.endsWith("it"),
  };
}

// ── PDFViewer main component ──────────────────────────────────────────────────
const PDFViewer = forwardRef<PDFViewerHandle, Props>((props, ref) => {
  const {
    filePath,
    scale,
    currentPage,
    searchQuery,
    accentColor,
    isDarkMode,
    onLoad,
    onPageChange,
    onSearchResults,
  } = props;

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // High-performance background page-parsing queue control state
  const [maxLoadedPage, setMaxLoadedPage] = useState(2);

  const { settings } = useSermonContext();
  const activeFontWeight =
    settings.fontWeight === "thin"
      ? 100
      : settings.fontWeight === "bold"
        ? 700
        : 400;
  const baseFontSize = 14 * scale;

  // ── Imperative page jump handlers ──────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    goToPage: (page: number) => {
      const element = document.getElementById(`page-${page}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    nextPage: () => {
      const nextPageNum = Math.min(currentPage + 1, pdfDoc?.numPages ?? 1);
      const element = document.getElementById(`page-${nextPageNum}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    prevPage: () => {
      const prevPageNum = Math.max(currentPage - 1, 1);
      const element = document.getElementById(`page-${prevPageNum}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  }));

  // Reset page loaders when switching book
  useEffect(() => {
    setMaxLoadedPage(2);
  }, [filePath]);

  // ── Load PDF document — reuse cache if available ──────────────────────────
  useEffect(() => {
    if (!filePath) return;
    let localCancelled = false;

    setIsLoading(true);
    setError(null);
    setPdfDoc(null);

    (async () => {
      try {
        let doc = pdfDocumentCache.get(filePath);
        if (!doc) {
          const data = await loadPdfBytes(filePath);
          if (localCancelled) return;
          const task = pdfjsLib.getDocument({ data, verbosity: 0 });
          doc = await task.promise;
          if (localCancelled) return;
          pdfDocumentCache.set(filePath, doc);
        }
        if (localCancelled) return;
        setPdfDoc(doc);
        onLoad(doc.numPages);
      } catch (err: any) {
        if (!localCancelled)
          setError(err?.message ?? String(err) ?? "Unknown error loading PDF");
      } finally {
        if (!localCancelled) setIsLoading(false);
      }
    })();

    return () => {
      localCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  // ── Search matching pages compilation ──────────────────────────────────────
  useEffect(() => {
    if (!pdfDoc || !searchQuery.trim()) {
      onSearchResults([], 0);
      return;
    }
    let cancelled = false;
    const q = searchQuery.toLowerCase();
    const matches: number[] = [];

    (async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) break;
        const pg = await pdfDoc.getPage(i);
        const content = await pg.getTextContent();
        const text = (content.items as any[])
          .map((it) => it.str ?? "")
          .join(" ")
          .toLowerCase();
        if (text.includes(q)) matches.push(i);
      }
      if (!cancelled) onSearchResults(matches, matches.length);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, searchQuery]);

  // Page active tracking callback
  const handlePageInViewport = useCallback((pageNum: number) => {
    onPageChange(pageNum);
  }, [onPageChange]);

  // ── Render states ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-40">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 w-full max-w-xl mx-auto">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-sm font-semibold text-red-400">Error</p>
        <p className="text-xs text-zinc-400 max-w-sm break-all">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full mx-auto transition-all duration-300 bg-white"
      style={{
        // backgroundColor: isDarkMode ? " #18181b" : "#ffffff",
        fontSize: `${baseFontSize}px`,
        lineHeight: "1.3",
        color: isDarkMode ? "#d6d3d1" : "#000000",
        fontFamily: settings.fontFamily || "Fraunces",
        fontWeight: activeFontWeight,
        fontStyle: settings.fontStyle || "normal",
        maxWidth: `min(70rem, ${Number(settings.readingWidth) || 100}%)`,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div className="space-y-4">
        {Array.from({ length: pdfDoc?.numPages ?? 0 }, (_, i) => i + 1).map((pageNum) => (
          <PDFPageBlock
            key={`${filePath}-${pageNum}`}
            pageNum={pageNum}
            pdfDoc={pdfDoc!}
            scale={scale}
            searchQuery={searchQuery}
            accentColor={accentColor}
            isDarkMode={isDarkMode}
            settings={settings}
            activeFontWeight={activeFontWeight}
            onPageInViewport={handlePageInViewport}
            isVisible={pageNum <= maxLoadedPage}
            onLoadComplete={() => {
              setMaxLoadedPage((prev) => Math.max(prev, pageNum + 1));
            }}
          />
        ))}
      </div>
    </div>
  );
});

// ── Lazy page block rendering component ─────────────────────────────────────
interface PageBlockProps {
  pageNum: number;
  pdfDoc: PDFDocumentProxy;
  scale: number;
  searchQuery: string;
  accentColor: string;
  isDarkMode: boolean;
  settings: any;
  activeFontWeight: any;
  onPageInViewport: (pageNum: number) => void;
  isVisible: boolean;
  onLoadComplete: () => void;
}

const PDFPageBlock: React.FC<PageBlockProps> = ({
  pageNum,
  pdfDoc,
  scale,
  searchQuery,
  accentColor,
  isDarkMode,
  settings,
  activeFontWeight,
  onPageInViewport,
  isVisible,
  onLoadComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paragraphs, setParagraphs] = useState<RebuiltParagraph[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPageInViewportRef = useRef(onPageInViewport);
  useEffect(() => {
    onPageInViewportRef.current = onPageInViewport;
  }, [onPageInViewport]);

  // Setup IntersectionObserver ONLY for page viewport tracking in the toolbar
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          onPageInViewportRef.current(pageNum);
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -45% 0px", // Trigger when page is in focus center of viewport
        threshold: [0, 0.5],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNum]);

  const onLoadCompleteRef = useRef(onLoadComplete);
  useEffect(() => {
    onLoadCompleteRef.current = onLoadComplete;
  }, [onLoadComplete]);

  // Load and parse page text content when isVisible becomes true
  useEffect(() => {
    if (!isVisible || paragraphs !== null || isLoading || error) return;

    setIsLoading(true);
    let cancelled = false;

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const [textResult, opResult] = await Promise.allSettled([
          page.getTextContent(),
          page.getOperatorList(),
        ]);
        if (cancelled) return;

        if (textResult.status === "rejected") throw textResult.reason;
        const textContent = textResult.value;
        const opList = opResult.status === "fulfilled" ? opResult.value : null;
        const styles = (textContent as any).styles ?? {};

        // Resolve bold/italic style configurations
        const fontStyleCache = new Map<string, { isBold: boolean; isItalic: boolean }>();
        const getFontStyle = (fontName: string) => {
          if (fontStyleCache.has(fontName)) return fontStyleCache.get(fontName)!;
          let isBold = false;
          let isItalic = false;

          try {
            if (page.commonObjs.has(fontName)) {
              const fontObj = page.commonObjs.get(fontName) as any;
              const psName = (fontObj?.name ?? "").toLowerCase();
              if (psName) {
                isBold =
                  psName.includes("bold") ||
                  psName.includes("-bd") ||
                  psName.endsWith("bd") ||
                  psName.includes("heavy") ||
                  psName.includes("black");
                isItalic =
                  psName.includes("italic") ||
                  psName.includes("oblique") ||
                  psName.includes("-it") ||
                  psName.endsWith("it");
                fontStyleCache.set(fontName, { isBold, isItalic });
                return { isBold, isItalic };
              }
            }
          } catch {}

          const { isBold: b, isItalic: it } = detectFontStyle(styles, fontName);
          fontStyleCache.set(fontName, { isBold: b, isItalic: it });
          return { isBold: b, isItalic: it };
        };

        // Underline rectangles detection
        interface URec { x1: number; x2: number; yTop: number }
        const underlineRects: URec[] = [];
        if (opList) {
          try {
            const OPS = (pdfjsLib as any).OPS;
            const { fnArray, argsArray } = opList;
            const rectOp = OPS?.rectangle;
            const constructOp = OPS?.constructPath;

            for (let i = 0; i < fnArray.length; i++) {
              if (rectOp !== undefined && fnArray[i] === rectOp) {
                const [rx, ry, rw, rh] = argsArray[i] as number[];
                if (Math.abs(rh) <= 2.5 && Math.abs(rw) > 4) {
                  underlineRects.push({ x1: rx, x2: rx + rw, yTop: ry + Math.max(0, rh) });
                }
              }
              if (constructOp !== undefined && fnArray[i] === constructOp && Array.isArray(argsArray[i]?.[0])) {
                const pathOps: number[] = argsArray[i][0];
                const coords: number[] = argsArray[i][1];
                let ci = 0;
                for (let pi = 0; pi < pathOps.length; pi++) {
                  if (pathOps[pi] === 10 && ci + 3 < coords.length) {
                    const rx = coords[ci];
                    const ry = coords[ci + 1];
                    const rw = coords[ci + 2];
                    const rh = coords[ci + 3];
                    ci += 4;
                    if (Math.abs(rh) <= 2.5 && Math.abs(rw) > 4) {
                      underlineRects.push({ x1: rx, x2: rx + rw, yTop: ry + Math.max(0, rh) });
                    }
                  } else {
                    const opLen = [2, 2, 6, 6, 0, 0, 0, 0, 0, 0, 4][pathOps[pi]] ?? 0;
                    ci += opLen;
                  }
                }
              }
            }
          } catch {}
        }

        const checkUnderline = (x: number, y: number, width: number): boolean => {
          if (!underlineRects.length) return false;
          return underlineRects.some(
            (r) => y - r.yTop >= 0 && y - r.yTop <= 5 && r.x1 < x + width && r.x2 > x
          );
        };

        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport.width;

        // Group runs into lines
        const linesMap = new Map<number, TextItemDetail[]>();
        for (const raw of textContent.items) {
          const item = raw as any;
          if (typeof item.str !== "string" || !item.str.trim()) continue;

          const transform: number[] = item.transform ?? [];
          const scaleY: number = transform[3] ?? 9;
          const x: number = transform[4] ?? 0;
          const y: number = transform[5] ?? 0;
          const itemWidth: number = item.width ?? 0;

          const { isBold, isItalic } = getFontStyle(item.fontName ?? "");
          const isUnderline = checkUnderline(x, y, itemWidth);

          let foundKey: number | null = null;
          for (const key of linesMap.keys()) {
            if (Math.abs(key - y) <= 2.5) { foundKey = key; break; }
          }

          const detail: TextItemDetail = { text: item.str, x, y, fontSize: scaleY, isBold, isItalic, isUnderline };
          if (foundKey !== null) {
            linesMap.get(foundKey)!.push(detail);
          } else {
            linesMap.set(y, [detail]);
          }
        }

        const sortedLines = Array.from(linesMap.entries())
          .sort(([ya], [yb]) => yb - ya)
          .map(([, items]) => items.sort((a, b) => a.x - b.x));

        // Detect paragraph breaks
        const gaps: number[] = [];
        for (let i = 0; i < sortedLines.length - 1; i++) {
          const dy = sortedLines[i][0].y - sortedLines[i + 1][0].y;
          if (dy > 0) gaps.push(dy);
        }
        gaps.sort((a, b) => a - b);
        const medianGap = gaps[Math.floor(gaps.length / 2)] ?? 11;
        const threshold = medianGap * 1.55;

        const rebuilt: RebuiltParagraph[] = [];
        let block: TextItemDetail[][] = [];
        for (let i = 0; i < sortedLines.length; i++) {
          const line = sortedLines[i];
          if (block.length > 0) {
            const gap = block[block.length - 1][0].y - line[0].y;
            if (gap > threshold) {
              rebuilt.push({ isHeading: false, isCentered: false, lines: block });
              block = [];
            }
          }
          block.push(line);
        }
        if (block.length > 0)
          rebuilt.push({ isHeading: false, isCentered: false, lines: block });

        rebuilt.forEach((p) => {
          p.isHeading = p.lines.every((l) => l.every((it) => it.fontSize >= 11));
          p.isCentered = p.lines.every((l) => {
            const minX = Math.min(...l.map((it) => it.x));
            const estW = l.reduce((s, it) => s + it.text.length * it.fontSize * 0.52, 0);
            return Math.abs(minX + estW / 2 - pageWidth / 2) < 40 && estW < pageWidth * 0.72;
          });
        });

        if (!cancelled) {
          setParagraphs(rebuilt);
          onLoadCompleteRef.current();
        }
        await page.cleanup();
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? String(err));
          onLoadCompleteRef.current();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isVisible, pdfDoc, pageNum]);

  const highlight = (text: string) => {
    const q = searchQuery.trim();
    if (!q) return <>{text}</>;
    const escaped = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark
              key={i}
              style={{ color: "inherit", borderRadius: 2, padding: "0 1px" }}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      id={`page-${pageNum}`}
      className="relative w-full transition-all duration-300"
      style={{
        minHeight: paragraphs === null ? "120px" : "auto",
      }}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }}
          />
        </div>
      )}

      {error && (
        <div className="text-center py-6 text-xs text-red-400">
          Error parsing page {pageNum}: {error}
        </div>
      )}

      {paragraphs && (
        <div className="space-y-4 select-text  ">
          {paragraphs.length === 0 && (
            <p className="text-sm text-center py-4 opacity-50">No text content found.</p>
          )}

          {paragraphs.map((p, pIdx) => {
            const align = p.isCentered ? "center" : "justify";

            if (p.isHeading) {
              return (
                <h2
                  key={pIdx}
                  className="font-bold pt-2"
                  style={{
                    fontSize: "1.28em",
                    textAlign: align,
                    fontFamily: settings.fontFamily || "Fraunces",
                    color: isDarkMode ? "#ffffff" : "#000000",
                  }}
                >
                  {p.lines.map((line, lIdx) => (
                    <span key={lIdx} className="block">
                      {line.map((item, iIdx) => (
                        <span key={iIdx}>
                          {item.isItalic ? <em>{highlight(item.text)}</em> : highlight(item.text)}{" "}
                        </span>
                      ))}
                    </span>
                  ))}
                </h2>
              );
            }

            return (
              <p
                key={pIdx}
                className="leading-relaxed"
                style={{
                  textAlign: align,
                  fontFamily: settings.fontFamily || "Fraunces",
                  fontWeight: activeFontWeight,
                  fontStyle: settings.fontStyle || "normal",
                }}
              >
                {p.lines.map((line, lIdx) => (
                  <React.Fragment key={lIdx}>
                    {line.map((item, iIdx) => {
                      let content: React.ReactNode = highlight(item.text);
                      if (item.fontSize < 6.5) {
                        content = <sup>{content}</sup>;
                      } else {
                        if (item.isUnderline && item.isBold && item.isItalic)
                          content = <u><strong><em>{content}</em></strong></u>;
                        else if (item.isUnderline && item.isBold)
                          content = <u><strong>{content}</strong></u>;
                        else if (item.isUnderline && item.isItalic)
                          content = <u><em>{content}</em></u>;
                        else if (item.isUnderline)
                          content = <u>{content}</u>;
                        else if (item.isBold && item.isItalic)
                          content = <strong><em>{content}</em></strong>;
                        else if (item.isBold)
                          content = <strong>{content}</strong>;
                        else if (item.isItalic)
                          content = <em>{content}</em>;
                      }
                      return <span key={iIdx}>{content} </span>;
                    })}{" "}
                  </React.Fragment>
                ))}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};

PDFViewer.displayName = "PDFViewer";
export default PDFViewer;
