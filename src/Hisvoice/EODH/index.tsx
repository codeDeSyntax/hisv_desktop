import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import {
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  Check,
  BookOpen,
} from "lucide-react";
import ReactDOM from "react-dom";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputVal, setPageInputVal] = useState("1");
  const [scale, setScale] = useState(() => {
    const saved = localStorage.getItem("eodhReaderScale");
    console.log("[EODH] Stored scale value in localStorage:", saved);
    return saved ? parseFloat(saved) : 1.25;
  });
  const [scalePercent, setScalePercent] = useState(() => {
    const saved = localStorage.getItem("eodhReaderScale");
    const val = saved ? parseFloat(saved) : 1.25;
    return Math.round(val * 100).toString();
  });

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchPages, setSearchMatchPages] = useState<number[]>([]);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const bookBtnRef = useRef<HTMLButtonElement>(null);
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const [bookDropdownPos, setBookDropdownPos] = useState({ top: 0, left: 0 });

  // Close book dropdown on outside click
  useEffect(() => {
    if (!isBookDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const clickedInsideButton = bookBtnRef.current?.contains(e.target as Node);
      const clickedInsideDropdown = bookDropdownRef.current?.contains(e.target as Node);
      if (!clickedInsideButton && !clickedInsideDropdown) {
        setIsBookDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isBookDropdownOpen]);

  const handleBookDropdownOpen = () => {
    if (!isBookDropdownOpen && bookBtnRef.current) {
      const rect = bookBtnRef.current.getBoundingClientRect();
      setBookDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
    setIsBookDropdownOpen((v) => !v);
  };

  const searchRef = useRef<HTMLInputElement>(null);

  // ── load PDF list ──────────────────────────────────────────────────────────
  const loadPdfList = useCallback(() => {
    setIsLoadingList(true);
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
    const handler = () => loadPdfList();
    window.addEventListener("eodh:refresh", handler);
    return () => window.removeEventListener("eodh:refresh", handler);
  }, [loadPdfList]);

  // ── open/close a PDF ──────────────────────────────────────────────────────
  const openPdf = (pdf: PdfFile) => {
    setSelectedPdf(pdf);
    setCurrentPage(1);
    setPageInputVal("1");
    setTotalPages(0);
    setSearchInput("");
    setSearchQuery("");
    setSearchMatchPages([]);
    setSearchMatchCount(0);
    setSearchMatchIndex(0);
    setIsSearchOpen(false);
  };

  const closePdf = () => setSelectedPdf(null);

  // ── zoom helpers ──────────────────────────────────────────────────────────
  const applyScale = (newScale: number) => {
    const clamped = Math.min(Math.max(newScale, 0.5), 3.0);
    const snapped = ZOOM_STEPS.reduce((prev, cur) =>
      Math.abs(cur - clamped) < Math.abs(prev - clamped) ? cur : prev
    );
    setScale(snapped);
    setScalePercent(Math.round(snapped * 100).toString());
    localStorage.setItem("eodhReaderScale", snapped.toString());
  };

  const zoomIn = () => {
    const idx = ZOOM_STEPS.findIndex((step) => Math.abs(step - scale) < 0.01);
    if (idx !== -1 && idx < ZOOM_STEPS.length - 1) {
      applyScale(ZOOM_STEPS[idx + 1]);
    }
  };

  const zoomOut = () => {
    const idx = ZOOM_STEPS.findIndex((step) => Math.abs(step - scale) < 0.01);
    if (idx > 0) {
      applyScale(ZOOM_STEPS[idx - 1]);
    }
  };

  // ── page navigation ───────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    setPageInputVal(String(clamped));
  };

  // ── search ────────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setSearchMatchIndex(0);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchMatchPages([]);
    setSearchMatchCount(0);
    setSearchMatchIndex(0);
  };

  const nextSearchMatch = () => {
    if (!searchMatchPages.length) return;
    const next = (searchMatchIndex + 1) % searchMatchPages.length;
    setSearchMatchIndex(next);
    goToPage(searchMatchPages[next]);
  };

  const prevSearchMatch = () => {
    if (!searchMatchPages.length) return;
    const prev = (searchMatchIndex - 1 + searchMatchPages.length) % searchMatchPages.length;
    setSearchMatchIndex(prev);
    goToPage(searchMatchPages[prev]);
  };

  // ── keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedPdf) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPage(currentPage - 1);
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && isSearchOpen) setIsSearchOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "=") { e.preventDefault(); zoomIn(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); zoomOut(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); applyScale(1.25); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPdf, currentPage, totalPages, isSearchOpen, scale]);

  // ── derived ────────────────────────────────────────────────────────────────
  const surfaceBg = isDarkMode ? "#09090b" : "#f4f4f5";
  const panelBg = isDarkMode ? "#18181b" : "#ffffff";
  const borderColor = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const mutedText = isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)";
  const bodyText = isDarkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)";

  // ── PDF LIST VIEW (thumbnail grid ─────────────────────────────────────────
  if (!selectedPdf) {
    return (
      <div
        className="flex flex-col h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-800/50"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
          {isLoadingList ? (
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
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: mutedText, opacity: 0.7 }}>
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
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl"
                      style={{
                        background: `linear-gradient(to bottom, transparent 40%, ${accentColor}30)`,
                      }}
                    />
                  </div>
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
      className="flex h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900"
      // style={{ backgroundColor: surfaceBg }}
    >
      {/* ── Main viewer ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-900">
        {/* ── Viewer toolbar ────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0 bg-neutral-50 dark:bg-neutral-900"
          // style={{ backgroundColor: panelBg, borderColor }}
        >
          <button
            onClick={closePdf}
            className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer border-0 transition-colors"
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
            <ArrowLeft size={14} />
          </button>

          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />

          {/* Book Select Dropdown */}
          <div
            className="relative"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <button
              ref={bookBtnRef}
              onClick={handleBookDropdownOpen}
              className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border-none text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                isDarkMode
                  ? "bg-neutral-800 hover:bg-neutral-800/60 text-white"
                  : "bg-neutral-100 hover:bg-neutral-100/85 text-zinc-950"
              }`}
              title="Select EODH Book"
            >
              <BookOpen className="w-[12px] h-[12px]" style={{ color: accentColor }} />
              <span className="font-sans max-w-[200px] truncate">
                {selectedPdf ? formatPdfName(selectedPdf.filename) : "Select Book"}
              </span>
              <ChevronDown
                className={`w-[11px] h-[11px] transition-transform duration-200 ${
                  isBookDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex-1" />

          {/* Search Toggle */}
          <button
            onClick={() => {
              setIsSearchOpen((v) => !v);
              if (!isSearchOpen)
                setTimeout(() => searchRef.current?.focus(), 60);
            }}
            className="h-6 px-2 rounded-md flex items-center gap-1.5 cursor-pointer border-0 transition-all duration-150 text-[11px] font-medium"
            style={{
              backgroundColor: isSearchOpen
                ? accentColor + "20"
                : isDarkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
              color: isSearchOpen ? accentColor : mutedText,
            }}
            title="Search (Ctrl+F)"
          >
            <Search size={11} />
            <span>Search</span>
          </button>

          {/* Inline search bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.form
                onSubmit={handleSearchSubmit}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 overflow-hidden flex-shrink-0"
              >
                <input
                  ref={searchRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Find in document…"
                  className="flex-1 text-[11px] h-6 px-2 rounded-md border outline-none min-w-0"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                    borderColor,
                    color: bodyText,
                  }}
                />
                {searchMatchCount > 0 && (
                  <span className="text-[10px] whitespace-nowrap" style={{ color: mutedText }}>
                    {searchMatchIndex + 1}/{searchMatchCount}
                  </span>
                )}
                {searchMatchCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSearchMatch}
                      className="w-5 h-5 rounded flex items-center justify-center cursor-pointer border-0"
                      style={{ color: mutedText, backgroundColor: "transparent" }}
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={nextSearchMatch}
                      className="w-5 h-5 rounded flex items-center justify-center cursor-pointer border-0"
                      style={{ color: mutedText, backgroundColor: "transparent" }}
                    >
                      <ChevronRight size={12} />
                    </button>
                  </>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="w-5 h-5 rounded flex items-center justify-center cursor-pointer border-0"
                    style={{ color: mutedText, backgroundColor: "transparent" }}
                  >
                    <X size={11} />
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="w-6 h-6 rounded flex items-center justify-center cursor-pointer border-0 disabled:opacity-30"
              style={{ color: mutedText, backgroundColor: "transparent" }}
              title="Zoom out (Ctrl+-)"
            >
              <ZoomOut size={13} />
            </button>
            <input
              value={scalePercent}
              onChange={(e) => setScalePercent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = parseInt(scalePercent, 10);
                  if (!isNaN(v)) applyScale(v / 100);
                }
              }}
              onBlur={() => {
                const v = parseInt(scalePercent, 10);
                if (!isNaN(v)) applyScale(v / 100);
              }}
              className="w-12 text-center text-[11px] h-6 rounded-md border outline-none"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
                borderColor,
                color: bodyText,
              }}
            />
            <span className="text-[11px]" style={{ color: mutedText }}>%</span>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="w-6 h-6 rounded flex items-center justify-center cursor-pointer border-0 disabled:opacity-30"
              style={{ color: mutedText, backgroundColor: "transparent" }}
              title="Zoom in (Ctrl+=)"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => applyScale(1.25)}
              className="w-5 h-5 rounded flex items-center justify-center cursor-pointer border-0"
              style={{ color: mutedText, backgroundColor: "transparent" }}
              title="Reset zoom (Ctrl+0)"
            >
              <RotateCcw size={10} />
            </button>
          </div>

          <div className="w-px h-4" style={{ backgroundColor: borderColor }} />

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-6 h-6 rounded flex items-center justify-center cursor-pointer border-0 disabled:opacity-30"
              style={{ color: mutedText, backgroundColor: "transparent" }}
              title="Previous page (←)"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: mutedText }}>
              <input
                value={pageInputVal}
                onChange={(e) => setPageInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = parseInt(pageInputVal, 10);
                    if (!isNaN(v)) goToPage(v);
                  }
                }}
                onBlur={() => {
                  const v = parseInt(pageInputVal, 10);
                  if (!isNaN(v)) goToPage(v);
                }}
                className="w-8 text-center h-6 rounded-md border outline-none text-[11px]"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                  borderColor,
                  color: bodyText,
                }}
              />
              <span>/ {totalPages || "—"}</span>
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-6 h-6 rounded flex items-center justify-center cursor-pointer border-0 disabled:opacity-30"
              style={{ color: mutedText, backgroundColor: "transparent" }}
              title="Next page (→)"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Document container ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto flex justify-center py-6 px-4 no-scrollbar bg-neutral-50 dark:bg-neutral-900">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-40">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${accentColor}30`, borderTopColor: accentColor }}
                />
              </div>
            }
          >
            <PDFViewer
              key={selectedPdf.path}
              filePath={selectedPdf.path}
              scale={scale}
              currentPage={currentPage}
              searchQuery={searchQuery}
              accentColor={accentColor}
              isDarkMode={isDarkMode}
              onLoad={(total) => setTotalPages(total)}
              onPageChange={(page) => {
                setCurrentPage(page);
                setPageInputVal(String(page));
              }}
              onSearchResults={(pages, total) => {
                setSearchMatchPages(pages);
                setSearchMatchCount(total);
                setSearchMatchIndex(0);
                if (pages.length > 0) {
                  setCurrentPage(pages[0]);
                  setPageInputVal(String(pages[0]));
                }
              }}
            />
          </Suspense>
        </div>
      </div>

      {ReactDOM.createPortal(
        <AnimatePresence>
          {isBookDropdownOpen && selectedPdf && (
            <motion.div
              ref={bookDropdownRef}
              key="book-picker-dropdown"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: bookDropdownPos.top,
                left: bookDropdownPos.left,
                zIndex: 99999,
              }}
              className={`rounded-xl shadow-xl border p-1 backdrop-blur-md overflow-y-auto no-scrollbar ${
                isDarkMode
                  ? "bg-neutral-700/90 border-zinc-800/80 text-white"
                  : "bg-white/90 border-zinc-200/60 text-zinc-950"
              }`}
            >
              {pdfList.map((pdf) => {
                const active = selectedPdf.path === pdf.path;
                return (
                  <button
                    key={pdf.path}
                    type="button"
                    onClick={() => {
                      openPdf(pdf);
                      setIsBookDropdownOpen(false);
                    }}
                    className={`w-full border-none bg-transparent text-left flex items-center justify-between gap-3 px-3 py-1 rounded-lg cursor-pointer transition-all duration-150 ${
                      active
                        ? isDarkMode
                          ? "text-white"
                          : "text-zinc-950"
                        : isDarkMode
                          ? "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                          : "hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800"
                    }`}
                    style={{
                      ...(active ? { backgroundColor: accentColor + "18" } : {}),
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-normal tracking-wide leading-normal truncate">
                        {formatPdfName(pdf.filename)}
                      </span>
                    </div>
                    {active && (
                      <Check
                        className="w-[12px] h-[12px] flex-shrink-0"
                        style={{ color: accentColor }}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default EODH;
