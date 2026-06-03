import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  BookText,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/Provider/Theme";
import type { EndnoteData } from "@/utils/endnoteParser";
import {
  fetchEndnoteResults,
  getSermonIndex,
  getSermonContent,
  type EndnoteSearchMode,
  type EndnoteSearchMatch,
  type EndnoteSearchResult,
  type SermonSection,
} from "@/utils/branhamApi";

// ── Types ────────────────────────────────────────────────────────────────────

interface SermonGroup {
  documentRecordId: string;
  datecode: string;
  title: string;
  isPrimary: boolean;
  matches: EndnoteSearchMatch[];
}

interface EndnoteSheetProps {
  endnoteData: EndnoteData | null;
  isOpen: boolean;
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a paragraph field from the API which can be "header", "326", or a range like "325-328".
 * Returns [start, end] as numbers, or null for non-numeric values like "header".
 */
function parseParagraphRange(p: string | number): [number, number] | null {
  const s = String(p);
  if (s === "header" || !s) return null;
  const parts = s.split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : start;
  if (isNaN(start)) return null;
  return [start, isNaN(end) ? start : end];
}

/** Check if a target paragraph number falls within a section's paragraph range. */
function sectionContainsParagraph(
  sectionPara: string | number,
  target: number,
): boolean {
  const range = parseParagraphRange(sectionPara);
  if (!range) return false;
  return target >= range[0] && target <= range[1];
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strip HTML tags and decode common entities from API-returned strings. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]{2,8};/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function highlightTerms(
  text: string,
  terms: string,
  accentColor: string,
  searchType?: "ExactPhrase" | "AllWords" | "ParagraphReference",
): React.ReactNode {
  const trimmed = terms.trim();
  if (!trimmed) return text;

  // ExactPhrase: highlight the full phrase as one match
  // AllWords/other: highlight individual words
  let pattern: RegExp;
  if (searchType === "ExactPhrase") {
    pattern = new RegExp(`(${escapeRegex(trimmed)})`, "gi");
  } else {
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (!words.length) return text;
    pattern = new RegExp(`(${words.map(escapeRegex).join("|")})`, "gi");
  }
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="font-thin"
            style={{
              backgroundColor: accentColor + "35",
              color: accentColor,
              borderRadius: "3px",
              padding: "0 2px",
            }}
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function groupResults(matches: EndnoteSearchMatch[]): SermonGroup[] {
  const map = new Map<string, EndnoteSearchMatch[]>();
  for (const m of matches) {
    if (!map.has(m.documentRecordId)) map.set(m.documentRecordId, []);
    map.get(m.documentRecordId)!.push(m);
  }
  const groups: SermonGroup[] = Array.from(map.entries()).map(
    ([docId, ms]) => ({
      documentRecordId: docId,
      datecode: ms[0].datecode,
      title: ms[0].title,
      isPrimary: ms.some((m) => m.isPrimary),
      matches: ms,
    }),
  );
  // Primary groups first
  return groups.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

// ── ReadMode overlay ──────────────────────────────────────────────────────────

interface ReadModeProps {
  sections: SermonSection[];
  group: SermonGroup;
  searchedText: string;
  searchType?: "ExactPhrase" | "AllWords" | "ParagraphReference";
  isDarkMode: boolean;
  accentColor: string;
  onClose: () => void;
}

const ReadMode: React.FC<ReadModeProps> = ({
  sections,
  group,
  searchedText,
  isDarkMode,
  accentColor,
  onClose,
}) => {
  const targetParaNums = group.matches.map((m) => Number(m.paragraph));

  return (
    <motion.div
      key="read-mode"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`fixed inset-0 z-[60] flex flex-col ${
        isDarkMode ? "bg-background" : "bg-zinc-50"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top bar */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 shrink-0 border-b ${
          isDarkMode ? "border-zinc-800" : "border-zinc-200"
        }`}
      >
        <button
          onClick={onClose}
          className={`p-1.5 rounded-full transition-colors shrink-0 ${
            isDarkMode
              ? "hover:bg-zinc-800 text-zinc-400"
              : "hover:bg-zinc-200 text-zinc-500"
          }`}
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: accentColor }}
          >
            {group.title || "Sermon"}
          </p>
          <p
            className={`text-[15px] ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
          >
            {group.datecode}
          </p>
        </div>
        <BookText
          size={15}
          style={{ color: accentColor, opacity: 0.6 }}
          className="shrink-0"
        />
      </div>

      {/* Scrollable reading body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="px- py-6 max-w-6xl mx-auto space-y-5">
          {sections.map((s) => {
            const isHit = targetParaNums.some((t) =>
              sectionContainsParagraph(s.Paragraph, t),
            );
            return (
              <div
                key={s.Paragraph}
                className={`flex gap-4 rounded-lg ${
                  isHit
                    ? isDarkMode
                      ? "bg-zinc-800/60"
                      : "bg-zinc-100/80"
                    : ""
                }`}
                style={
                  isHit
                    ? {
                        borderLeft: `3px solid ${accentColor}`,
                        paddingLeft: "14px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingRight: "12px",
                      }
                    : undefined
                }
              >
                <span
                  className="font- font-bold shrink-0 select-none"
                  style={{
                    fontSize: "12px",
                    marginTop: "4px",
                    minWidth: "26px",
                    color: isHit
                      ? accentColor
                      : isDarkMode
                        ? "#57534e"
                        : "#a8a29e",
                  }}
                >
                  {s.Paragraph}.
                </span>
                <p
                  style={{
                    fontSize: "50px",
                    lineHeight: "1.9",
                    color: isDarkMode ? "#e7e5e4" : "#1c1917",
                  }}
                >
                  {isHit
                    ? highlightTerms(
                        stripHtml(s.Content),
                        searchedText,
                        accentColor,
                      )
                    : stripHtml(s.Content)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// ── ContextViewer ─────────────────────────────────────────────────────────────

interface ContextViewerProps {
  sections: SermonSection[];
  group: SermonGroup;
  searchedText: string;
  isDarkMode: boolean;
  accentColor: string;
  onReadMode: () => void;
}

const ContextViewer: React.FC<ContextViewerProps> = ({
  sections,
  group,
  searchedText,
  isDarkMode,
  accentColor,
  onReadMode,
}) => {
  const targetParaNums = group.matches.map((m) => Number(m.paragraph));

  if (!sections.length) {
    return (
      <p
        className={`text-xs italic px-1 py-2 ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
      >
        No paragraph content available.
      </p>
    );
  }

  return (
    <div className="mt-2">
      {/* Read Mode trigger */}
      <div className="flex justify-end mb-2">
        <button
          onClick={onReadMode}
          className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
          }`}
        >
          <BookText size={11} style={{ color: accentColor }} />
          <span>Read Mode</span>
        </button>
      </div>

      <div className="space-y-1">
        {sections.map((s) => {
          const isHit = targetParaNums.some((t) =>
            sectionContainsParagraph(s.Paragraph, t),
          );
          return (
            <div
              key={s.Paragraph}
              className="flex gap-2 rounded-md px-2 py-1 transition-colors"
              style={{
                borderLeft: isHit
                  ? `3px solid ${accentColor}`
                  : "3px solid transparent",
                backgroundColor: isHit ? accentColor + "12" : undefined,
              }}
            >
              <span
                className=" font-bold shrink-0 text-[11px] mt-0.5 select-none"
                style={{
                  color: isHit
                    ? accentColor
                    : isDarkMode
                      ? "#78716c"
                      : "#a8a29e",
                  minWidth: "22px",
                }}
              >
                {s.Paragraph}.
              </span>
              <span
                className={`text-[16px] font-thin leading-relaxed ${
                  isDarkMode ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                {isHit
                  ? highlightTerms(
                      stripHtml(s.Content),
                      searchedText,
                      accentColor,
                    )
                  : stripHtml(s.Content)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── GroupCard ─────────────────────────────────────────────────────────────────

interface GroupCardProps {
  group: SermonGroup;
  searchResult: EndnoteSearchResult;
  endnoteTargetParagraph: number;
  endnoteQuoteText: string | null;
  isDarkMode: boolean;
  accentColor: string;
  expandedId: string | null;
  loadingId: string | null;
  sections: SermonSection[] | undefined;
  onLoadContext: (group: SermonGroup) => void;
  onToggleExpand: (docId: string) => void;
  onReadMode: (group: SermonGroup, sections: SermonSection[]) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  searchResult,
  endnoteTargetParagraph,
  endnoteQuoteText,
  isDarkMode,
  accentColor,
  expandedId,
  loadingId,
  sections,
  onLoadContext,
  onToggleExpand,
  onReadMode,
}) => {
  const isExpanded = expandedId === group.documentRecordId;
  const isLoading = loadingId === group.documentRecordId;
  const isLoaded = sections !== undefined;

  return (
    <div
      className={` border overflow-hidden transition-colors border-solid border-x-0 border-t-0 ${
        isDarkMode
          ? group.isPrimary
            ? "border-zinc-600 bg-zinc-800/60"
            : "border-zinc-700 bg-zinc-800/40"
          : group.isPrimary
            ? "border-zinc-300 bg-zinc-50"
            : "border-zinc-200 bg-white"
      }`}
    >
      {/* ── Compact single-row header ── */}
      <div className="flex items-center gap-2 px-3 py-2 ">
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span
            className="font-archivo text-[15px] font-bold shrink-0"
            style={{ color: accentColor }}
          >
            {group.datecode}
          </span>
          {group.isPrimary && (
            <span
              className="text-[15px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: accentColor + "20",
                color: accentColor,
              }}
            >
              Primary
            </span>
          )}
          <span
            className={`text-[20px] truncate font-thin ${
              isDarkMode ? "text-white" : "text-zinc-500"
            }`}
          >
            {group.title || "Untitled Sermon"}
          </span>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            if (isLoaded) onToggleExpand(group.documentRecordId);
            else onLoadContext(group);
          }}
          disabled={isLoading}
          className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px]  transition-all ${
            isDarkMode
              ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <>
              <span
                className="w-2.5 h-2.5 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: `${accentColor}50`,
                  borderTopColor: accentColor,
                }}
              />
              <span>Loading</span>
            </>
          ) : isLoaded ? (
            isExpanded ? (
              <>
                <ChevronUp size={11} />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown size={11} />
                <span>Expand</span>
              </>
            )
          ) : (
            <span>Load</span>
          )}
        </button>
      </div>

      {/* ── Fragment rows ── */}
      {group.matches.length > 0 && (
        <div className="px-3 pb-3">
          {(() => {
            // For primary groups, show the endnote's own target paragraph + quote
            // directly from the parsed data — don't rely on search result fragments
            if (group.isPrimary && endnoteTargetParagraph > 0) {
              const totalMatches = group.matches.length;
              // Use the endnote's own quote text directly
              const displayText = endnoteQuoteText || searchResult.searchedText;

              return (
                <>
                  <div className="flex items-start gap-2 min-w-0 py-0.5">
                    <span
                      className="font-archivo font-bold shrink-0 text-[14px] select-none mt-0.5"
                      style={{ color: accentColor, minWidth: "28px" }}
                    >
                      ¶{endnoteTargetParagraph}
                    </span>
                    <span
                      className={`!text-[18px] font-thin leading-snug line-clamp-3 ${
                        isDarkMode ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {highlightTerms(
                        displayText,
                        searchResult.searchedText,
                        accentColor,
                      )}
                    </span>
                  </div>
                  {totalMatches > 1 && (
                    <p
                      className={`text-[11px] mt-1 ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      +{totalMatches - 1} more match
                      {totalMatches - 1 !== 1 ? "es" : ""} in this sermon
                    </p>
                  )}
                </>
              );
            }

            // Non-primary groups: show first few fragments
            const MAX_FRAGMENTS = 3;
            const visible = group.matches.slice(0, MAX_FRAGMENTS);
            const remaining = group.matches.length - visible.length;

            return (
              <>
                {visible.map((m) => (
                  <div
                    key={m.recordId}
                    className="flex items-start gap-2 min-w-0 py-0.5"
                  >
                    <span
                      className=" font-bold shrink-0 text-[15px] select-none mt-0.5"
                      style={{
                        color: isDarkMode ? "#ffffff" : "#a8a29e",
                        minWidth: "28px",
                      }}
                    >
                      ¶{m.paragraph}
                    </span>
                    <span
                      className={`text-[16px] leading-snug font-thin line-clamp-2 ${
                        isDarkMode ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {highlightTerms(
                        stripHtml(m.fragment),
                        searchResult.searchedText,
                        accentColor,
                      )}
                    </span>
                  </div>
                ))}
                {remaining > 0 && (
                  <p
                    className={`text-[11px] mt-1 ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    +{remaining} more match{remaining !== 1 ? "es" : ""} in this
                    sermon
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Expanded context */}
      <AnimatePresence>
        {isExpanded && sections && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={`px-3 pb-3 ${isDarkMode ? "border-t border-zinc-700" : "border-t border-zinc-200"}`}
            >
              <ContextViewer
                sections={sections}
                group={group}
                searchedText={searchResult.searchedText}
                isDarkMode={isDarkMode}
                accentColor={accentColor}
                onReadMode={() => onReadMode(group, sections)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── EndnoteSheet ──────────────────────────────────────────────────────────────

const EndnoteSheet: React.FC<EndnoteSheetProps> = ({
  endnoteData,
  isOpen,
  onClose,
}) => {
  const { isDarkMode, accentColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<EndnoteSearchResult | null>(
    null,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupSections, setGroupSections] = useState<
    Map<string, SermonSection[]>
  >(new Map());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<EndnoteSearchMode>("Auto");
  const [readMode, setReadMode] = useState<{
    group: SermonGroup;
    sections: SermonSection[];
  } | null>(null);

  // Cancellation token for in-flight searches
  const requestTokenRef = useRef(0);

  // Fetch results whenever the sheet opens with new endnote data
  useEffect(() => {
    if (!isOpen || !endnoteData) return;

    const token = ++requestTokenRef.current;
    setLoading(true);
    setError(null);
    setSearchResult(null);
    setExpandedId(null);
    setGroupSections(new Map());
    setReadMode(null);

    fetchEndnoteResults(endnoteData, searchMode)
      .then((result) => {
        if (token !== requestTokenRef.current) return;
        setSearchResult(result);
      })
      .catch((err: unknown) => {
        if (token !== requestTokenRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch quote. Please check your connection.",
        );
      })
      .finally(() => {
        if (token !== requestTokenRef.current) return;
        setLoading(false);
      });
  }, [isOpen, endnoteData, searchMode]);

  const loadContext = useCallback(
    async (group: SermonGroup) => {
      setLoadingId(group.documentRecordId);
      try {
        const index = await getSermonIndex();
        const sermonId = index.get(group.datecode);
        // Fallback: use documentRecordId as SermonRecordId if numeric lookup fails
        const sections = await getSermonContent(
          sermonId,
          sermonId === undefined ? group.documentRecordId : undefined,
        );

        // For primary matches, prefer the endnote's parsed paragraph number (the actual reference)
        // over the search result's paragraph (which may be a different occurrence of the quote)
        const endnotePara = endnoteData?.paragraph
          ? parseInt(endnoteData.paragraph, 10)
          : 0;
        const searchPara = group.matches[0]?.paragraph ?? 0;
        const targetPara =
          group.isPrimary && endnotePara > 0 ? endnotePara : searchPara;

        // Find the section containing the target paragraph.
        // API returns paragraph ranges like "325-328", so we must check if targetPara falls within each range.
        let targetIndex = sections.findIndex((s) =>
          sectionContainsParagraph(s.Paragraph, targetPara),
        );

        // If not found in any range, find the closest section by range start
        if (targetIndex === -1) {
          let minDist = Infinity;
          sections.forEach((s, i) => {
            const range = parseParagraphRange(s.Paragraph);
            if (!range) return;
            // Distance from target to the nearest edge of the range
            const dist =
              targetPara < range[0]
                ? range[0] - targetPara
                : targetPara > range[1]
                  ? targetPara - range[1]
                  : 0;
            if (dist < minDist) {
              minDist = dist;
              targetIndex = i;
            }
          });
        }

        // Slice by array index: 3 before, 50 after the target
        const before = 3;
        const after = 50;
        const startIdx = Math.max(0, targetIndex - before);
        const endIdx = Math.min(sections.length, targetIndex + after + 1);
        const context = sections.slice(startIdx, endIdx);

        setGroupSections((prev) => {
          const next = new Map(prev);
          next.set(group.documentRecordId, context);
          return next;
        });
        setExpandedId(group.documentRecordId);
      } catch {
        // Store empty array so we show the "no content" message rather than re-loading
        setGroupSections((prev) => {
          const next = new Map(prev);
          next.set(group.documentRecordId, []);
          return next;
        });
        setExpandedId(group.documentRecordId);
      } finally {
        setLoadingId(null);
      }
    },
    [endnoteData],
  );

  const toggleExpand = useCallback((docId: string) => {
    setExpandedId((prev) => (prev === docId ? null : docId));
  }, []);

  const groups = searchResult ? groupResults(searchResult.matches) : [];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="endnote-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/45 z-40"
              onClick={() => {
                if (readMode) setReadMode(null);
                else onClose();
              }}
              style={{ backdropFilter: "blur(2px)" }}
            />

            {/* Bottom sheet */}
            <motion.div
              key="endnote-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className={`fixed bottom-0 left-0 right-0 z-50 flex  pb-10 flex-col rounded-t-2xl overflow-hidden min-h-[44vh] w-full max-w-5xl mx-auto ${
                isDarkMode
                  ? "bg-primary border-t border-zinc-700"
                  : "bg-white border-t border-zinc-200"
              }`}
              style={{ maxHeight: "80vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start px-10 justify-between  pb-3 pt-1 p-2 shrink-0 bg-background">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} style={{ color: accentColor }} />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: accentColor }}
                    >
                      Endnote Reference
                    </span>
                  </div>
                  {endnoteData?.datecode && (
                    <p
                      className={`text-xs mt-0.5 truncate ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      {endnoteData.datecode}
                      {endnoteData.title ? ` — ${endnoteData.title}` : ""}
                    </p>
                  )}

                  <div className="mt-2 inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    {(
                      ["Auto", "ExactPhrase", "AllWords"] as EndnoteSearchMode[]
                    ).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSearchMode(mode)}
                        className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                          searchMode === mode
                            ? "text-white"
                            : isDarkMode
                              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                              : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        }`}
                        style={
                          searchMode === mode
                            ? { backgroundColor: accentColor }
                            : undefined
                        }
                      >
                        {mode === "ExactPhrase"
                          ? "Exact Phrase"
                          : mode === "AllWords"
                            ? "All Words"
                            : "Auto"}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-full transition-colors ${
                    isDarkMode
                      ? "hover:bg-zinc-700 text-zinc-400"
                      : "hover:bg-zinc-100 text-zinc-500"
                  }`}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Divider */}
              <div
                className={`shrink-0 ${isDarkMode ? "border-t border-zinc-700" : "border-t border-zinc-100"}`}
              />

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: `${accentColor}40`,
                        borderTopColor: accentColor,
                      }}
                    />
                    <p
                      className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      Searching quotes…
                    </p>
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="flex flex-col items-center justify-center py-12 px-6 gap-3 text-center">
                    <AlertCircle size={24} className="text-rose-400" />
                    <p
                      className={`text-sm ${isDarkMode ? "text-zinc-300" : "text-zinc-600"}`}
                    >
                      {error}
                    </p>
                    {endnoteData?.datecode && (
                      <p
                        className={`text-xs font-archivo ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Sermon · {endnoteData.datecode}
                      </p>
                    )}
                  </div>
                )}

                {/* Results */}
                {!loading && !error && searchResult && (
                  <div className="px-10 py-3 space-y-3 pb-6">
                    {/* Search meta */}
                    <div className="flex items-center gap-1.5">
                      <Search size={11} style={{ color: accentColor }} />
                      <span
                        className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}
                      >
                        {searchResult.matches.length} result
                        {searchResult.matches.length !== 1 ? "s" : ""} ·{" "}
                        <span
                          className={`italic ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          &ldquo;
                          {searchResult.searchedText.length > 45
                            ? searchResult.searchedText.slice(0, 45) + "…"
                            : searchResult.searchedText}
                          &rdquo;
                        </span>
                        <span className="ml-1 font-medium">
                          (
                          {searchResult.searchType === "AllWords"
                            ? "All Words"
                            : searchResult.searchType === "ExactPhrase"
                              ? "Exact Phrase"
                              : "Paragraph Reference"}
                          )
                        </span>
                      </span>
                    </div>

                    {/* Group cards */}
                    {groups.map((group) => (
                      <GroupCard
                        key={group.documentRecordId}
                        group={group}
                        searchResult={searchResult}
                        endnoteTargetParagraph={
                          endnoteData?.paragraph
                            ? parseInt(endnoteData.paragraph, 10)
                            : 0
                        }
                        endnoteQuoteText={endnoteData?.quoteText ?? null}
                        isDarkMode={isDarkMode}
                        accentColor={accentColor}
                        expandedId={expandedId}
                        loadingId={loadingId}
                        sections={groupSections.get(group.documentRecordId)}
                        onLoadContext={loadContext}
                        onToggleExpand={toggleExpand}
                        onReadMode={(g, s) =>
                          setReadMode({ group: g, sections: s })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Read Mode — slides over the bottom sheet */}
            <AnimatePresence>
              {readMode && (
                <ReadMode
                  key="read-mode"
                  sections={readMode.sections}
                  group={readMode.group}
                  searchedText={searchResult?.searchedText ?? ""}
                  isDarkMode={isDarkMode}
                  accentColor={accentColor}
                  onClose={() => setReadMode(null)}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EndnoteSheet;
