import { app, ipcMain } from "electron";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from "electron-updater";

// Always load via createRequire — never a static import so Vite never bundles it
const { autoUpdater } = createRequire(import.meta.url)("electron-updater");

// ── Preferences ───────────────────────────────────────────────────────────────
function prefsPath() {
  return path.join(app.getPath("userData"), "update-prefs.json");
}
function readPrefs(): { autoUpdate: boolean } {
  try {
    return JSON.parse(fs.readFileSync(prefsPath(), "utf8"));
  } catch {
    return { autoUpdate: false };
  }
}
function writePrefs(prefs: { autoUpdate: boolean }) {
  fs.writeFileSync(prefsPath(), JSON.stringify(prefs, null, 2), "utf8");
}

// ── Main export ───────────────────────────────────────────────────────────────
export function update(win: Electron.BrowserWindow) {
  const prefs = readPrefs();
  autoUpdater.autoDownload = prefs.autoUpdate;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;

  const send = (status: string, extra?: object) => {
    if (!win.isDestroyed())
      win.webContents.send("update-status", { status, ...extra });
  };

  autoUpdater.on("checking-for-update", () => send("checking"));

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    if (autoUpdater.autoDownload) {
      send("downloading", { version: info.version, percent: 0 });
    } else {
      send("available", { version: info.version });
    }
  });

  autoUpdater.on("update-not-available", () => send("up-to-date"));

  autoUpdater.on("download-progress", (info: ProgressInfo) =>
    send("downloading", { percent: Math.floor(info.percent) }),
  );

  autoUpdater.on("update-downloaded", (info: UpdateDownloadedEvent) =>
    send("ready", { version: info.version }),
  );

  autoUpdater.on("error", (err: Error) =>
    send("error", { message: err.message }),
  );

  // ── IPC handlers ────────────────────────────────────────────────────────────
  ipcMain.handle("check-update", async () => {
    try {
      send("checking");
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (err: any) {
      send("error", { message: err.message });
    }
  });

  ipcMain.handle("download-update", async () => {
    try {
      send("downloading", { percent: 0 });
      await autoUpdater.downloadUpdate();
    } catch (err: any) {
      send("error", { message: err.message });
    }
  });

  ipcMain.handle("get-update-preference", () => readPrefs());

  ipcMain.handle("set-update-preference", (_e, p: { autoUpdate: boolean }) => {
    writePrefs(p);
    autoUpdater.autoDownload = p.autoUpdate;
    return p;
  });

  ipcMain.handle("quit-and-install", () =>
    autoUpdater.quitAndInstall(false, true),
  );

  // Auto-check 3 seconds after renderer loads (gives React time to mount)
  win.webContents.once("did-finish-load", () => {
    setTimeout(
      () => autoUpdater.checkForUpdatesAndNotify().catch(() => {}),
      3000,
    );
  });
}
