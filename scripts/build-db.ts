/**
 * Compatibility wrapper for the desktop sermon DB builder.
 *
 * The actual site/import/build pipeline lives in scripts/siteandbuildscripts.
 * This wrapper keeps `npx tsx scripts/build-db.ts` working while avoiding the
 * native better-sqlite3 build dependency during database generation.
 */

import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const outputArgs = args.length > 0 ? ["--output", args[0]] : [];
const result = spawnSync(
  "python",
  [
    "scripts/siteandbuildscripts/build_sermons_db.py",
    ...outputArgs,
  ],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);
