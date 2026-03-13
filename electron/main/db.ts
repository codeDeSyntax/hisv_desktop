/**
 * electron/main/db.ts
 * SQLite database manager for the main process.
 * Provides open/close, query helpers, and a GitHub download helper.
 */

import { createRequire } from "node:module";
import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import https from "node:https";
import http from "node:http";

const require = createRequire(import.meta.url);
// better-sqlite3 is a native CJS module – must be loaded via require in ESM
const Database = require("better-sqlite3");
type DBInstance = ReturnType<typeof Database>;

// ── configuration ─────────────────────────────────────────────────────────────
const DB_FILENAME = "sermons.db";

/**
 * URL to the pre-built database hosted on GitHub Releases.
 *
 * You can override this with HISVOICE_DB_URL for custom mirrors/CDN.
 */
export const GITHUB_DB_URL =
  process.env.HISVOICE_DB_URL ??
  "https://github.com/codeDeSyntax/hisv_desktop/releases/latest/download/sermons.db";

// ── path helpers ─────────────────────────────────────────────────────────────
export function getDbPath(): string {
  if (!app.isPackaged) {
    // Dev: use the local pre-built db in the project's resources/ folder
    return path.join(process.env.APP_ROOT!, "resources", DB_FILENAME);
  }
  // Production: db was downloaded to userData on first launch
  return path.join(app.getPath("userData"), DB_FILENAME);
}

export function dbExists(): boolean {
  try {
    const p = getDbPath();
    return fs.existsSync(p) && fs.statSync(p).size > 0;
  } catch {
    return false;
  }
}

// ── connection ────────────────────────────────────────────────────────────────
let _db: DBInstance | null = null;

export function openDb(): DBInstance {
  if (_db) return _db;
  _db = new Database(getDbPath(), { readonly: true, fileMustExist: true });
  _db.pragma("journal_mode = WAL");
  return _db;
}

export function closeDb(): void {
  if (_db) {
    try {
      _db.close();
    } catch {}
    _db = null;
  }
}

// ── query helpers ─────────────────────────────────────────────────────────────
export interface SermonMeta {
  id: string;
  title: string;
  year: string | null;
  date: string | null;
  type: string | null;
  location: string | null;
  audio_url: string | null;
  download_link: string | null;
}

export interface SermonFull extends SermonMeta {
  sermon_text: string | null;
}

export interface FTSResult {
  id: string;
  title: string;
  year: string | null;
  location: string | null;
  type: string | null;
  snippet: string;
  rowid: number;
}

/** Returns all sermons without the heavy sermon_text column (for fast startup). */
export function getSermonsMeta(): SermonMeta[] {
  const db = openDb();
  return db
    .prepare(
      `SELECT id, title, year, date, type, location,
              audio_url, download_link
       FROM sermons
       ORDER BY year ASC, date ASC`,
    )
    .all() as SermonMeta[];
}

/** Returns a single sermon including full text. */
export function getSermonById(id: string | number): SermonFull | undefined {
  const db = openDb();
  return db.prepare(`SELECT * FROM sermons WHERE id = ?`).get(String(id)) as
    | SermonFull
    | undefined;
}

/**
 * Full-text search via FTS5.
 * Returns up to 100 matches with highlighted snippets.
 */
export function searchSermons(query: string): FTSResult[] {
  if (!query || query.trim().length < 2) return [];
  const db = openDb();

  // Sanitize query: escape special FTS5 characters
  const safe = query.replace(/["*^]/g, " ").trim();
  if (!safe) return [];

  try {
    return db
      .prepare(
        `SELECT s.id, s.title, s.year, s.location, s.type,
                snippet(sermons_fts, 1, '<mark>', '</mark>', '...', 32) AS snippet,
                sermons_fts.rowid
         FROM sermons_fts
         JOIN sermons s ON s.rowid = sermons_fts.rowid
         WHERE sermons_fts MATCH ?
         ORDER BY sermons_fts.rank
         LIMIT 100`,
      )
      .all(safe + "*") as FTSResult[];
  } catch {
    // Fallback: LIKE search if FTS5 query syntax is invalid
    return db
      .prepare(
        `SELECT id, title, year, location, type,
                substr(sermon_text, 1, 200) AS snippet,
                rowid
         FROM sermons
         WHERE sermon_text LIKE ?
         LIMIT 100`,
      )
      .all(`%${safe}%`) as FTSResult[];
  }
}

// ── download helper ──────────────────────────────────────────────────────────

export type ProgressCallback = (progress: number) => void;

let _downloading = false;

/**
 * Download the database file from a URL, following redirects.
 * Reports progress 0–100 via the callback.
 * Only one download may run at a time; concurrent calls resolve immediately.
 */
export function downloadDb(
  url: string,
  onProgress: ProgressCallback,
): Promise<void> {
  if (_downloading) return Promise.resolve();
  _downloading = true;

  return new Promise((resolve, reject) => {
    // Production path — in dev this should never be called since dbExists()=true
    const destPath = path.join(app.getPath("userData"), DB_FILENAME);
    const tmpPath = destPath + ".download";

    // Clean up any previous partial download; ignore errors (file may be locked)
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // If we can't delete it, try a timestamped temp name instead
    }

    let fileStream: fs.WriteStream;
    try {
      fileStream = fs.createWriteStream(tmpPath);
    } catch (err) {
      _downloading = false;
      reject(err);
      return;
    }

    const doRequest = (requestUrl: string, redirectsLeft: number) => {
      if (redirectsLeft <= 0) {
        reject(new Error("Too many redirects"));
        return;
      }

      const mod = requestUrl.startsWith("https://") ? https : http;

      mod
        .get(requestUrl, (res) => {
          // Follow redirects (GitHub releases redirect to CDN)
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            res.resume();
            doRequest(res.headers.location, redirectsLeft - 1);
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${requestUrl}`));
            return;
          }

          const total = parseInt(res.headers["content-length"] ?? "0", 10);
          let received = 0;

          res.on("data", (chunk: Buffer) => {
            received += chunk.length;
            if (total > 0) {
              onProgress(Math.round((received / total) * 100));
            }
          });

          res.pipe(fileStream);

          fileStream.on("finish", () => {
            fileStream.close(() => {
              try {
                // Atomic rename: only replace DB after full download
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                fs.renameSync(tmpPath, destPath);
                onProgress(100);
                _downloading = false;
                resolve();
              } catch (err) {
                _downloading = false;
                reject(err);
              }
            });
          });
        })
        .on("error", (err: Error) => {
          _downloading = false;
          fs.unlink(tmpPath, () => {});
          reject(err);
        });
    };

    doRequest(url, 10);
  });
}
