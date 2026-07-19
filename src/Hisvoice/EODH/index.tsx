import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import PDFThumbnail from "./PDFThumbnail";

const PDFViewer = lazy(() => import("./PDFViewer"));

// ── types ────────────────────────────────────────────────────────────────────
export interface PdfFile {
  name: string;
  filename: string;
  path: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function formatPdfName(raw: string): string {
  return raw
    .replace(/\.pdf$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

// ── main component ────────────────────────────────────────────────────────────
const EODH: React.FC = () => {
  const { isDarkMode, accentColor } = useTheme();

  // PDF list state
  const [pdfList, setPdfList] = useState<PdfFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Viewer state
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [totalPages, setTotalPages] = useState(0);


  // ── load PDF list ─────────────────────────────────────────────────────────
  const loadPdfList = useCallback(() => {
    setIsLoadingList(true);

    // Load from main process
    window.ipcRenderer
      .invoke("eodh:list-pdfs")
      .then((files: PdfFile[]) => {
        setPdfList(files);
        setIsLoadingList(false);
      })
      .catch(() => {
        setIsLoadingList(false);
      });
  }, []);

  useEffect(() => {
    loadPdfList();
  }, [loadPdfList]);

  // Listen for external refresh trigger (from NavBar button)
  useEffect(() => {
    const handler = () => {
      loadPdfList();
    };
    window.addEventListener("eodh:refresh", handler);
    return () => window.removeEventListener("eodh:refresh", handler);
  }, [loadPdfList]);

  // ── open/close a PDF ──────────────────────────────────────────────────────
  const openPdf = (pdf: PdfFile) => {
    setSelectedPdf(pdf);
    setTotalPages(0);
  };

  const closePdf = () => setSelectedPdf(null);

  // ── derived ────────────────────────────────────────────────────────────────
  const surfaceBg = isDarkMode ? "#09090b" : "#f4f4f5";
  const panelBg = isDarkMode ? "#18181b" : "#ffffff";
  const borderColor = isDarkMode
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.07)";
  const mutedText = isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)";
  const bodyText = isDarkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)";

  // ── PDF LIST VIEW (thumbnail grid — no internal header) ──────────────────
  if (!selectedPdf) {
    return (
      <div
        className="flex flex-col h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-800/50 "
        // style={{ backgroundColor: surfaceBg }}
      >
        {/* Scrollable thumbnail grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
          {isLoadingList ? (
            /* Skeleton thumbnails */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 animate-pulse">
                  <div
                    className="rounded-xl"
                    style={{
                      height: 240,
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                    }}
                  />
                  <div
                    className="h-3 rounded-full mx-4"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : pdfList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div
                className="w-16 h-20 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                }}
              >
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-sm font-medium" style={{ color: mutedText }}>
                No PDFs in the EODH folder
              </p>
              <p
                className="text-xs max-w-xs leading-relaxed"
                style={{ color: mutedText, opacity: 0.7 }}
              >
                Place PDF files in{" "}
                <code
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  }}
                >
                  resources/eodh/
                </code>{" "}
                and use the Refresh button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 auto-rows-fr items-stretch">
              {pdfList.map((pdf) => (
                <button
                  key={pdf.path}
                  onClick={() => openPdf(pdf)}
                  className="flex h-full flex-col items-center gap-1.5 cursor-pointer border-0 bg-transparent outline-none group justify-start self-stretch hover:scale-[1.02] active:scale-[0.97] transition-transform"
                >
                  {/* Thumbnail preview */}
                  <div
                    className="relative rounded-xl overflow-hidden transition-all duration-200 ring-0 group-hover:ring-2 shadow-sm group-hover:shadow-lg"
                    style={{
                      boxShadow: `0 2px 8px rgba(0,0,0,${isDarkMode ? 0.4 : 0.12})`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        `0 6px 20px rgba(0,0,0,${isDarkMode ? 0.5 : 0.18}), 0 0 0 2px ${accentColor}60`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        `0 2px 8px rgba(0,0,0,${isDarkMode ? 0.4 : 0.12})`;
                    }}
                  >
                    <PDFThumbnail
                      filePath={pdf.path}
                      targetWidth={132}
                      isDarkMode={isDarkMode}
                    />

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl"
                      style={{
                        background: `linear-gradient(to bottom, transparent 40%, ${accentColor}30)`,
                      }}
                    />
                  </div>

                  {/* File name */}
                  <span
                    className="text-[10px] font-medium leading-snug text-center line-clamp-2 max-w-[132px] px-1"
                    style={{ color: bodyText }}
                  >
                    {formatPdfName(pdf.filename)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PDF VIEWER VIEW ───────────────────────────────────────────────────────
  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* ── Main viewer ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Viewer toolbar ────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0"
          style={{ backgroundColor: panelBg, borderColor }}
        >
          <button
            onClick={closePdf}
            className="flex items-center gap-1.5 h-6 px-2 rounded-md cursor-pointer border-0 transition-colors flex-shrink-0"
            style={{ color: mutedText, backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = isDarkMode
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            title="Back to library"
          >
            <ArrowLeft size={13} />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Library
            </span>
          </button>

          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />

          {/* Document name */}
          <span
            className="text-[11px] font-semibold truncate max-w-[280px] flex-shrink-0"
            style={{ color: bodyText }}
          >
            {formatPdfName(selectedPdf.filename)}
          </span>

          <div className="flex-1" />

          <span className="text-[10px]" style={{ color: mutedText }}>
            Native PDF Viewer - Use Ctrl+F to search
          </span>
        </div>

        {/* ── PDF iframe area ───────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: `${accentColor}30`,
                    borderTopColor: accentColor,
                  }}
                />
              </div>
            }
          >
            <PDFViewer
              filePath={selectedPdf.path}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default EODH;
