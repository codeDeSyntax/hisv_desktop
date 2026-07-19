/**
 * Optimized search utilities with caching, debouncing, and incremental loading.
 */

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { searchIndexCache, textContentCache } from "./pdfCache";

let searchAbortController: AbortController | null = null;

/**
 * Extract and cache text content from a PDF page
 */
export async function getPageTextCached(
  doc: PDFDocumentProxy,
  filePath: string,
  pageNum: number,
): Promise<string> {
  // Check cache first
  const cached = textContentCache.getPageText(filePath, pageNum);
  if (cached !== null) {
    return cached;
  }

  try {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((it: any) => it.str)
      .join(" ")
      .toLowerCase();

    console.log(`[searchUtils] Extracted text from page ${pageNum}:`, text.substring(0, 50), `(${text.length} chars)`);

    // Store in cache
    textContentCache.setPageText(filePath, pageNum, text);
    return text;
  } catch (err) {
    console.error(`Failed to extract text from page ${pageNum}:`, err);
    return "";
  }
}

/**
 * Perform full-text search on PDF with caching
 * Returns page numbers that match the query
 */
export async function searchPdfCached(
  doc: PDFDocumentProxy,
  filePath: string,
  query: string,
  onProgress?: (current: number, total: number) => void,
): Promise<number[]> {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  console.log("[searchUtils] Searching for:", q, "in", filePath);

  // Check search index cache
  const cachedResult = searchIndexCache.getMatchPages(filePath, query);
  if (cachedResult !== null) {
    console.log("[searchUtils] Cache hit for:", query, "results:", cachedResult);
    return cachedResult;
  }

  // Cancel previous search
  if (searchAbortController) {
    searchAbortController.abort();
  }
  searchAbortController = new AbortController();

  const matches: number[] = [];
  const totalPages = doc.numPages;
  console.log("[searchUtils] Total pages to search:", totalPages);

  // Progressive search with yielding to avoid blocking
  for (let i = 1; i <= totalPages; i++) {
    if (searchAbortController.signal.aborted) {
      return [];
    }

    const text = await getPageTextCached(doc, filePath, i);
    
    // Debug: show first few pages' text
    if (i <= 3) {
      console.log(`[searchUtils] Page ${i} text preview:`, text.substring(0, 100));
    }

    if (text.includes(q)) {
      matches.push(i);
      console.log(`[searchUtils] Match found on page ${i}`);
    }

    // Yield to UI every 10 pages
    if (i % 10 === 0) {
      onProgress?.(i, totalPages);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  console.log("[searchUtils] Final matches:", matches);
  // Cache the search results
  searchIndexCache.setMatchPages(filePath, query, matches);

  return matches;
}

/**
 * Cancel any in-flight search
 */
export function cancelSearch(): void {
  if (searchAbortController) {
    searchAbortController.abort();
    searchAbortController = null;
  }
}

/**
 * Debounced search that prevents excessive searching
 */
export function createDebouncedSearch(
  doc: PDFDocumentProxy,
  filePath: string,
  delayMs = 300,
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (query: string, onResult: (pages: number[]) => void): (() => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      const results = await searchPdfCached(doc, filePath, query);
      onResult(results);
    }, delayMs);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  };
}
