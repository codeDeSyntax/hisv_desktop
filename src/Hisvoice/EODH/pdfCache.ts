/**
 * High-performance PDF caching layer with memory management.
 * Prevents redundant PDF loading, thumbnail rendering, and text extraction.
 */

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  size: number;
}

type PageTextIndex = { [pageNum: number]: string };

const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
let currentCacheSize = 0;

// ── PDF Document Cache ──────────────────────────────────────────────────────
class PDFDocumentCache {
  private cache = new Map<string, CacheEntry<PDFDocumentProxy>>();

  set(filePath: string, doc: PDFDocumentProxy): void {
    // Rough estimate: ~500KB per cached PDF
    const size = 500 * 1024;
    if (currentCacheSize + size > MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    this.cache.set(filePath, {
      data: doc,
      timestamp: Date.now(),
      size,
    });
    currentCacheSize += size;
  }

  get(filePath: string): PDFDocumentProxy | null {
    const entry = this.cache.get(filePath);
    if (entry) {
      entry.timestamp = Date.now(); // Update for LRU
      return entry.data;
    }
    return null;
  }

  private evictOldest(): void {
    let oldest: { path: string; time: number } | null = null;
    for (const [path, entry] of this.cache) {
      if (!oldest || entry.timestamp < oldest.time) {
        oldest = { path, time: entry.timestamp };
      }
    }
    if (oldest) {
      const entry = this.cache.get(oldest.path)!;
      this.cache.delete(oldest.path);
      currentCacheSize -= entry.size;
      try {
        (entry.data as any).cleanup?.();
      } catch {}
    }
  }

  clear(): void {
    for (const entry of this.cache.values()) {
      try {
        (entry.data as any).cleanup?.();
      } catch {}
    }
    this.cache.clear();
    currentCacheSize = 0;
  }
}

// ── Thumbnail Image Cache ──────────────────────────────────────────────────
class ThumbnailCache {
  private cache = new Map<string, CacheEntry<string>>();

  set(filePath: string, dataUrl: string): void {
    // Data URL size estimate: ~20-30 KB per thumbnail
    const size = Math.max(30 * 1024, dataUrl.length);
    if (currentCacheSize + size > MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    this.cache.set(filePath, {
      data: dataUrl,
      timestamp: Date.now(),
      size,
    });
    currentCacheSize += size;
  }

  get(filePath: string): string | null {
    const entry = this.cache.get(filePath);
    if (entry) {
      entry.timestamp = Date.now(); // Update for LRU
      return entry.data;
    }
    return null;
  }

  private evictOldest(): void {
    let oldest: { path: string; time: number } | null = null;
    for (const [path, entry] of this.cache) {
      if (!oldest || entry.timestamp < oldest.time) {
        oldest = { path, time: entry.timestamp };
      }
    }
    if (oldest) {
      const entry = this.cache.get(oldest.path)!;
      this.cache.delete(oldest.path);
      currentCacheSize -= entry.size;
    }
  }

  clear(): void {
    this.cache.clear();
    currentCacheSize = 0;
  }
}

// ── Text Content Cache (per-PDF) ────────────────────────────────────────────
class TextContentCacheStore {
  private cache = new Map<string, { index: PageTextIndex; timestamp: number; size: number }>();

  set(filePath: string, textIndex: PageTextIndex): void {
    const size = JSON.stringify(textIndex).length;
    if (currentCacheSize + size > MAX_CACHE_SIZE) {
      const oldest = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) {
        this.cache.delete(oldest[0]);
        currentCacheSize -= oldest[1].size;
      }
    }
    this.cache.set(filePath, { index: textIndex, timestamp: Date.now(), size });
    currentCacheSize += size;
  }

  get(filePath: string): PageTextIndex | null {
    const entry = this.cache.get(filePath);
    if (!entry) return null;
    entry.timestamp = Date.now();
    return entry.index;
  }

  setPageText(filePath: string, pageNum: number, text: string): void {
    let entry = this.cache.get(filePath);
    if (!entry) {
      entry = { index: {}, timestamp: Date.now(), size: 0 };
      this.cache.set(filePath, entry);
    }
    entry.index[pageNum] = text;
    entry.timestamp = Date.now();
    const newSize = JSON.stringify(entry.index).length;
    currentCacheSize += newSize - entry.size;
    entry.size = newSize;
  }

  getPageText(filePath: string, pageNum: number): string | null {
    const entry = this.cache.get(filePath);
    if (!entry) return null;
    entry.timestamp = Date.now();
    return entry.index[pageNum] ?? null;
  }

  clear(): void {
    this.cache.clear();
    currentCacheSize = 0;
  }
}

// ── Search Index Cache (for full-text search) ───────────────────────────────
interface SearchIndex {
  [query: string]: number[]; // query -> page numbers
}

class SearchIndexCache {
  private cache = new Map<string, { index: SearchIndex; timestamp: number; size: number }>();

  set(filePath: string, index: SearchIndex): void {
    const size = JSON.stringify(index).length;
    if (currentCacheSize + size > MAX_CACHE_SIZE) {
      const oldest = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) {
        this.cache.delete(oldest[0]);
        currentCacheSize -= oldest[1].size;
      }
    }
    this.cache.set(filePath, { index, timestamp: Date.now(), size });
    currentCacheSize += size;
  }

  get(filePath: string): SearchIndex | null {
    const entry = this.cache.get(filePath);
    if (!entry) return null;
    entry.timestamp = Date.now();
    return entry.index;
  }

  getMatchPages(filePath: string, query: string): number[] | null {
    const entry = this.cache.get(filePath);
    if (!entry) return null;
    entry.timestamp = Date.now();
    return entry.index[query.toLowerCase()] ?? null;
  }

  setMatchPages(filePath: string, query: string, pages: number[]): void {
    let entry = this.cache.get(filePath);
    if (!entry) {
      entry = { index: {}, timestamp: Date.now(), size: 0 };
      this.cache.set(filePath, entry);
    }
    entry.index[query.toLowerCase()] = pages;
    entry.timestamp = Date.now();
    const newSize = JSON.stringify(entry.index).length;
    currentCacheSize += newSize - entry.size;
    entry.size = newSize;
  }

  clear(): void {
    this.cache.clear();
    currentCacheSize = 0;
  }
}

// ── PDF List Cache ─────────────────────────────────────────────────────────
interface CachedPdfList {
  files: Array<{ name: string; filename: string; path: string }>;
  timestamp: number;
}

const PDF_LIST_CACHE_DURATION = 30000; // 30 seconds

let cachedPdfList: CachedPdfList | null = null;

export function getCachedPdfList(): Array<{
  name: string;
  filename: string;
  path: string;
}> | null {
  if (
    cachedPdfList &&
    Date.now() - cachedPdfList.timestamp < PDF_LIST_CACHE_DURATION
  ) {
    return cachedPdfList.files;
  }
  return null;
}

export function setCachedPdfList(
  files: Array<{ name: string; filename: string; path: string }>,
): void {
  cachedPdfList = {
    files,
    timestamp: Date.now(),
  };
}

export function clearPdfListCache(): void {
  cachedPdfList = null;
}

// ── Exports ─────────────────────────────────────────────────────────────────
export const pdfDocumentCache = new PDFDocumentCache();
export const thumbnailCache = new ThumbnailCache();
export const textContentCache = new TextContentCacheStore();
export const searchIndexCache = new SearchIndexCache();

export function clearAllCaches(): void {
  pdfDocumentCache.clear();
  thumbnailCache.clear();
  textContentCache.clear();
  searchIndexCache.clear();
  clearPdfListCache();
  currentCacheSize = 0;
}

export function getCacheStats(): {
  pdfDocuments: number;
  thumbnails: number;
  memoryUsed: string;
} {
  return {
    pdfDocuments: (pdfDocumentCache as any).cache.size,
    thumbnails: (thumbnailCache as any).cache.size,
    memoryUsed: `${(currentCacheSize / 1024 / 1024).toFixed(1)}MB`,
  };
}
