import type { EndnoteData } from "./endnoteParser";

export interface SermonSection {
  Paragraph: number;
  Content: string;
  IsHit: boolean;
}

export interface EndnoteSearchMatch {
  recordId: string;
  documentRecordId: string;
  datecode: string;
  title: string;
  paragraph: number;
  fragment: string;
  isPrimary: boolean;
}

export interface EndnoteSearchResult {
  matches: EndnoteSearchMatch[];
  searchedText: string;
  searchType: "ExactPhrase" | "AllWords" | "ParagraphReference";
}

export type EndnoteSearchMode = "Auto" | "ExactPhrase" | "AllWords";

// ── IPC bridge — all network calls go through the main process to avoid CORS ──
async function ipcPost(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  // window.ipcRenderer is exposed by the preload script
  const ipc = (window as any).ipcRenderer as {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
  const result = (await ipc.invoke("branham:fetch", endpoint, body)) as {
    ok: boolean;
    status: number;
    data?: unknown;
    error?: string;
  };
  if (!result.ok) {
    throw new Error(
      result.error ?? `branham API error (status ${result.status})`,
    );
  }
  return result.data;
}

// ── Sermon index cache: datecode ("56-0527") → numeric SermonProductIdentityId ──
let sermonIndexCache: Map<string, number> | null = null;

export async function getSermonIndex(): Promise<Map<string, number>> {
  if (sermonIndexCache) return sermonIndexCache;

  const data = await ipcPost("/index/allSermons", { Language: "en" });
  const d = data as any;
  const sermonList: { p: string; i: number }[] =
    d?.Result?.Sermons ?? d?.Sermons ?? [];
  sermonIndexCache = new Map<string, number>(sermonList.map((s) => [s.p, s.i]));
  return sermonIndexCache;
}

export async function getSermonContent(
  sermonId?: number,
  sermonRecordId?: string,
): Promise<SermonSection[]> {
  if (sermonId === undefined && !sermonRecordId) {
    throw new Error("Must supply either sermonId or sermonRecordId");
  }

  const body: Record<string, unknown> = {
    Language: "en",
    GetAllContent: true,
    HighlightQuery: null,
  };
  if (sermonId !== undefined) body.SermonProductIdentityId = sermonId;
  if (sermonRecordId) body.SermonRecordId = sermonRecordId;

  const data = await ipcPost("/sermons/sermonRequest", body);
  return (data as any)?.Result?.Sections ?? [];
}

// ── Internal: raw search against /userQuery ──
interface RawResult {
  RecordId: string;
  DocumentRecordId: string;
  Properties: {
    DateCode: string;
    Title: string;
    Paragraph: string;
    Fragment: string;
  };
}

async function searchText(
  text: string,
  searchType: "ExactPhrase" | "AllWords",
): Promise<RawResult[]> {
  const data = await ipcPost("/userQuery", {
    Language: "en",
    SearchType: searchType,
    Text: text,
    PageSize: 50,
  });
  return (data as any)?.Result?.Results ?? [];
}

function toMatch(
  r: RawResult,
  primaryDatecode: string | null,
): EndnoteSearchMatch {
  return {
    recordId: r.RecordId,
    documentRecordId: r.DocumentRecordId,
    datecode: r.Properties.DateCode,
    title: r.Properties.Title,
    paragraph: parseInt(r.Properties.Paragraph, 10) || 0,
    fragment: r.Properties.Fragment,
    isPrimary: !!primaryDatecode && r.Properties.DateCode === primaryDatecode,
  };
}

// ── Main: 3-step fallback search ──
export async function fetchEndnoteResults(
  endnoteData: EndnoteData,
  mode: EndnoteSearchMode = "Auto",
): Promise<EndnoteSearchResult> {
  if (mode === "ExactPhrase") {
    if (!endnoteData.longQuote) {
      throw new Error("No quote text available for Exact Phrase search.");
    }

    const raw = await searchText(endnoteData.longQuote, "ExactPhrase");
    if (raw.length === 0) {
      throw new Error("No results found with Exact Phrase. Try All Words.");
    }

    return {
      matches: raw.map((r) => toMatch(r, endnoteData.datecode)),
      searchedText: endnoteData.longQuote,
      searchType: "ExactPhrase",
    };
  }

  if (mode === "AllWords") {
    if (!endnoteData.keywords) {
      throw new Error("No keywords available for All Words search.");
    }

    const raw = await searchText(endnoteData.keywords, "AllWords");
    if (raw.length === 0) {
      throw new Error("No results found with All Words. Try Exact Phrase.");
    }

    return {
      matches: raw.map((r) => toMatch(r, endnoteData.datecode)),
      searchedText: endnoteData.keywords,
      searchType: "AllWords",
    };
  }

  // Step 1 — ExactPhrase (first 8 words of quote text)
  if (endnoteData.longQuote) {
    try {
      const raw = await searchText(endnoteData.longQuote, "ExactPhrase");
      if (raw.length > 0) {
        return {
          matches: raw.map((r) => toMatch(r, endnoteData.datecode)),
          searchedText: endnoteData.longQuote,
          searchType: "ExactPhrase",
        };
      }
    } catch {
      // fall through to next step
    }
  }

  // Step 2 — AllWords (top 3 meaningful keywords)
  if (endnoteData.keywords) {
    try {
      const raw = await searchText(endnoteData.keywords, "AllWords");
      if (raw.length > 0) {
        return {
          matches: raw.map((r) => toMatch(r, endnoteData.datecode)),
          searchedText: endnoteData.keywords,
          searchType: "AllWords",
        };
      }
    } catch {
      // fall through to next step
    }
  }

  // Step 3 — Paragraph reference: search by datecode or title via /userQuery,
  // then filter results to ±2 paragraphs of the target (mirrors mobile app approach)
  const refTexts: string[] = [];
  if (endnoteData.datecode) refTexts.push(endnoteData.datecode);
  if (endnoteData.title) refTexts.push(endnoteData.title);

  if (refTexts.length > 0 && endnoteData.paragraph) {
    const targetPara = parseInt(endnoteData.paragraph, 10);

    for (const refText of refTexts) {
      try {
        const raw = await searchText(refText, "ExactPhrase");
        if (raw.length === 0) continue;

        // Filter to ±2 paragraphs of the target; if nothing is close, return all
        const nearby = raw.filter((r) => {
          const p = parseInt(r.Properties.Paragraph, 10);
          return !isNaN(p) && Math.abs(p - targetPara) <= 2;
        });
        const finalMatches = nearby.length > 0 ? nearby : raw;

        return {
          matches: finalMatches.map((r) => ({
            ...toMatch(r, endnoteData.datecode),
            isPrimary: true,
          })),
          searchedText: refText,
          searchType: "ParagraphReference" as const,
        };
      } catch {
        // try next refText
      }
    }
  }

  throw new Error(
    "Could not locate this quote. Try searching for it manually.",
  );
}
