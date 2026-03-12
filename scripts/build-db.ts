/**
 * Build script: converts all sermon TypeScript data files into a SQLite database.
 * Run with:  npx tsx scripts/build-db.ts [output-path]
 * Default output: resources/sermons.db
 *
 * Upload the resulting file to GitHub Releases so the app can download it on first launch.
 */

import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

// ── resolve output path ──────────────────────────────────────────────────────
const outArg = process.argv[2];
const outPath = outArg
  ? path.resolve(outArg)
  : path.join(ROOT, "resources", "sermons.db");

const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

console.log(`Building database → ${outPath}`);

// ── import sermon data ───────────────────────────────────────────────────────
// These are loaded via tsx at build time – import paths must use .js extension
// (TypeScript ESM convention) but tsx resolves them to the actual .ts files.

const { default: audioSermons } = await import(
  "../src/sermons/audio.js" as string
);
const { default: earlySermons } = await import(
  "../src/sermons/1964-1969/firstset.js" as string
);
const { default: sermons1970 } = await import(
  "../src/sermons/1970/1970.js" as string
);
const { default: sermons1971 } = await import(
  "../src/sermons/1971/1971.js" as string
);
const { default: sermons1972 } = await import(
  "../src/sermons/1972/1972.js" as string
);
const { default: sermons1973 } = await import(
  "../src/sermons/1973/1973.js" as string
);

const allSermons = [
  ...audioSermons,
  ...earlySermons,
  ...sermons1970,
  ...sermons1971,
  ...sermons1972,
  ...sermons1973,
];

console.log(`Total sermons: ${allSermons.length}`);

// ── create database ──────────────────────────────────────────────────────────
const db = new Database(outPath);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS sermons (
    id           TEXT UNIQUE NOT NULL,
    title        TEXT NOT NULL,
    year         TEXT,
    date         TEXT,
    type         TEXT,
    location     TEXT,
    audio_url    TEXT,
    download_link TEXT,
    sermon_text  TEXT
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS sermons_fts USING fts5(
    title,
    sermon_text,
    content=sermons,
    content_rowid=rowid
  );
`);

// ── insert rows ──────────────────────────────────────────────────────────────
const insert = db.prepare(`
  INSERT OR IGNORE INTO sermons
    (id, title, year, date, type, location, audio_url, download_link, sermon_text)
  VALUES
    (@id, @title, @year, @date, @type, @location, @audio_url, @download_link, @sermon_text)
`);

const insertMany = db.transaction((sermons: typeof allSermons) => {
  for (const s of sermons) {
    insert.run({
      id: String(s.id),
      title: s.title ?? "",
      year: s.year ?? null,
      date: s.date ?? null,
      type: s.type ?? null,
      location: (s as any).location ?? null,
      audio_url: (s as any).audioUrl ?? null,
      download_link: (s as any).downloadLink ?? null,
      sermon_text: (s as any).sermon ?? null,
    });
  }
});

insertMany(allSermons);
console.log("Rows inserted.");

// ── build FTS index ──────────────────────────────────────────────────────────
console.log("Building FTS5 index (this may take a moment)...");
db.exec(`INSERT INTO sermons_fts(sermons_fts) VALUES('rebuild')`);

// ── verify ───────────────────────────────────────────────────────────────────
const count = (db.prepare("SELECT COUNT(*) as n FROM sermons").get() as any).n;
const ftsCount = (
  db.prepare("SELECT COUNT(*) as n FROM sermons_fts").get() as any
).n;
console.log(`Done. Sermons: ${count}, FTS rows: ${ftsCount}. File: ${outPath}`);

const stats = fs.statSync(outPath);
console.log(`Database size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

db.close();
