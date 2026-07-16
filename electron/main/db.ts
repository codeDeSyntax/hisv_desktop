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
const DB_RELEASE_MARKER_FILENAME = "sermons-db-release.json";

/**
 * URL to the pre-built database hosted on GitHub Releases.
 *
 * You can override this with HISVOICE_DB_URL for custom mirrors/CDN.
 */
export const GITHUB_DB_URL =
  process.env.HISVOICE_DB_URL ??
  "https://github.com/codeDeSyntax/hisvoice-data/releases/latest/download/sermon.db";

export const GITHUB_LATEST_RELEASE_API_URL =
  process.env.HISVOICE_RELEASE_API_URL ??
  "https://api.github.com/repos/codeDeSyntax/hisvoice-data/releases/latest";

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size?: number;
  updated_at?: string;
}

interface GitHubLatestRelease {
  tag_name: string;
  published_at?: string;
  assets?: GitHubReleaseAsset[];
}

export interface DbReleaseMarker {
  tagName: string;
  publishedAt?: string;
  assetName: string;
  assetSize?: number;
  assetUpdatedAt?: string;
}

export interface DbUpdateStatus {
  checked: boolean;
  updateAvailable: boolean;
  reason?: string;
  local?: DbReleaseMarker;
  remote?: DbReleaseMarker;
  downloadUrl?: string;
  error?: string;
}

// ── path helpers ─────────────────────────────────────────────────────────────
export function getDbPath(): string {
  if (!app.isPackaged) {
    // Dev: use the local pre-built db in the project's resources/ folder
    return path.join(process.env.APP_ROOT!, "resources", DB_FILENAME);
  }
  // Production: db is downloaded to userData on first launch/update.
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

function requestText(url: string, redirectsLeft = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    if (redirectsLeft <= 0) {
      reject(new Error("Too many redirects"));
      return;
    }

    const mod = url.startsWith("https://") ? https : http;
    const request = mod.get(
      url,
      {
        headers: {
          Accept: "application/vnd.github+json, application/json",
          "User-Agent": "hisvoice-desktop",
        },
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          requestText(res.headers.location, redirectsLeft - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }

        res.setEncoding("utf8");
        let body = "";
        res.on("data", (chunk: string) => {
          body += chunk;
        });
        res.on("end", () => resolve(body));
      },
    );

    request.setTimeout(10_000, () => {
      request.destroy(new Error("Request timed out"));
    });
    request.on("error", reject);
  });
}

// ── connection ────────────────────────────────────────────────────────────────
let _db: DBInstance | null = null;

export function openDb(): DBInstance {
  if (_db) return _db;
  _db = new Database(getDbPath(), { fileMustExist: true });
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
function getDbReleaseMarkerPath(): string {
  return path.join(path.dirname(getDbPath()), DB_RELEASE_MARKER_FILENAME);
}

export function getLocalDbReleaseMarker(): DbReleaseMarker | null {
  try {
    const markerPath = getDbReleaseMarkerPath();
    if (!fs.existsSync(markerPath)) return null;
    return JSON.parse(
      fs.readFileSync(markerPath, "utf-8"),
    ) as DbReleaseMarker;
  } catch {
    return null;
  }
}

function writeLocalDbReleaseMarker(marker: DbReleaseMarker): void {
  const markerPath = getDbReleaseMarkerPath();
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(markerPath, JSON.stringify(marker, null, 2) + "\n", "utf-8");
}

export async function fetchLatestDbRelease(): Promise<{
  marker: DbReleaseMarker;
  downloadUrl: string;
}> {
  const body = await requestText(GITHUB_LATEST_RELEASE_API_URL);
  const release = JSON.parse(body) as GitHubLatestRelease;
  const dbAsset = release.assets?.find((asset) => asset.name === "sermon.db");

  if (!release.tag_name) {
    throw new Error("Latest GitHub release has no tag name");
  }

  if (!dbAsset?.browser_download_url) {
    throw new Error(`Latest GitHub release has no sermon.db asset`);
  }

  return {
    marker: {
      tagName: release.tag_name,
      publishedAt: release.published_at,
      assetName: dbAsset.name,
      assetSize: dbAsset.size,
      assetUpdatedAt: dbAsset.updated_at,
    },
    downloadUrl: dbAsset.browser_download_url,
  };
}

export async function checkDbUpdate(): Promise<DbUpdateStatus> {
  if (!dbExists()) {
    return {
      checked: true,
      updateAvailable: true,
      reason: "missing",
    };
  }

  try {
    const local = getLocalDbReleaseMarker();
    const latest = await fetchLatestDbRelease();
    const remote = latest.marker;

    if (!local?.tagName) {
      return {
        checked: true,
        updateAvailable: true,
        reason: "local-release-marker-missing",
        remote,
        downloadUrl: latest.downloadUrl,
      };
    }

    const updateAvailable = local.assetSize !== remote.assetSize;

    return {
      checked: true,
      updateAvailable,
      reason: updateAvailable ? "latest-release-changed" : "current",
      local,
      remote,
      downloadUrl: latest.downloadUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      checked: false,
      updateAvailable: false,
      reason: "check-failed",
      local: getLocalDbReleaseMarker() ?? undefined,
      error: message,
    };
  }
}

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

export type SearchMode = "all" | "exact";

function normalizeSearchInput(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function buildFtsQuery(
  normalizedQuery: string,
  mode: SearchMode,
): string | null {
  if (!normalizedQuery) return null;

  if (mode === "exact") {
    return `"${normalizedQuery.replace(/"/g, '""')}"`;
  }

  const terms = normalizedQuery
    .split(/\s+/)
    .map((term) =>
      term.replace(/["*^:(){}\[\]~!@#$%&=+,./\\<>?|`';-]/g, "").trim(),
    )
    .filter(Boolean);

  if (terms.length === 0) return null;

  return terms.map((term) => `${term}*`).join(" AND ");
}

function runLikeFallback(db: DBInstance, normalizedQuery: string): FTSResult[] {
  if (!normalizedQuery) return [];

  return db
    .prepare(
      `SELECT id, title, year, location, type,
              substr(sermon_text, 1, 200) AS snippet,
              rowid
       FROM sermons
       WHERE sermon_text LIKE ?
       LIMIT 100`,
    )
    .all(`%${normalizedQuery}%`) as FTSResult[];
}

function hasTable(db: DBInstance, tableName: string): boolean {
  const row = db
    .prepare(
      `SELECT name
       FROM sqlite_master
       WHERE type IN ('table', 'virtual table') AND name = ?
       LIMIT 1`,
    )
    .get(tableName);
  return Boolean(row);
}

function isSearchIndexBuilt(db: DBInstance): boolean {
  try {
    const row = db
      .prepare("SELECT value FROM sermon_db_meta WHERE key = 'search_index_included'")
      .get() as { value: string } | undefined;
    return row?.value === "true";
  } catch {
    return false;
  }
}

function markSearchIndexBuilt(db: DBInstance): void {
  try {
    db.prepare(
      "INSERT OR REPLACE INTO sermon_db_meta (key, value, updated_at) VALUES ('search_index_included', 'true', datetime('now'))"
    ).run();
  } catch (err) {
    console.error("Failed to mark search index as built:", err);
  }
}

function ensureSearchIndex(db: DBInstance): void {
  if (!hasTable(db, "sermons_fts")) {
    db.exec(`
      CREATE VIRTUAL TABLE sermons_fts USING fts5(
        title,
        sermon_text,
        content=sermons,
        content_rowid=rowid
      );
    `);
  }

  if (!isSearchIndexBuilt(db)) {
    db.exec(`INSERT INTO sermons_fts(sermons_fts) VALUES('rebuild')`);
    markSearchIndexBuilt(db);
  }
}

export function buildSearchIndex(): { success: boolean; error?: string } {
  try {
    const db = openDb();
    ensureSearchIndex(db);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
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
export function searchSermons(
  query: string,
  mode: SearchMode = "all",
): FTSResult[] {
  if (!query || query.trim().length < 2) return [];
  const db = openDb();

  const normalized = normalizeSearchInput(query);
  if (!normalized) return [];

  const ftsQuery = buildFtsQuery(normalized, mode);

  // Symbol-heavy inputs can collapse to empty FTS terms; use LIKE fallback.
  if (!ftsQuery) {
    return runLikeFallback(db, normalized);
  }

  try {
    ensureSearchIndex(db);

    const ftsRows = db
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
      .all(ftsQuery) as FTSResult[];

    if (ftsRows.length > 0) {
      return ftsRows;
    }

    // Fallback for valid but non-matching FTS syntax (e.g. heavy punctuation).
    return runLikeFallback(db, normalized);
  } catch {
    // Fallback: LIKE search if FTS5 query syntax is invalid
    return runLikeFallback(db, normalized);
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
  releaseMarker?: DbReleaseMarker,
): Promise<void> {
  if (_downloading) return Promise.resolve();
  _downloading = true;
  closeDb();

  return new Promise((resolve, reject) => {
    const destPath = getDbPath();
    const tmpPath = destPath + ".download";
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

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
                if (fs.existsSync(destPath + "-wal")) {
                  fs.unlinkSync(destPath + "-wal");
                }
                if (fs.existsSync(destPath + "-shm")) {
                  fs.unlinkSync(destPath + "-shm");
                }
                fs.renameSync(tmpPath, destPath);
                if (releaseMarker) {
                  writeLocalDbReleaseMarker(releaseMarker);
                }
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
