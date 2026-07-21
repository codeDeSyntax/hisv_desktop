import { app, BrowserWindow, shell, ipcMain, screen, Display } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { getSystemFonts } from "./fonts.js";
import { update } from "./update.js";
import {
  dbExists,
  getDbPath,
  getSermonsMeta,
  getSermonById,
  searchSermons,
  downloadDb,
  closeDb,
  buildSearchIndex,
  checkDbUpdate,
  fetchLatestDbRelease,
  getLocalDbReleaseMarker,
  GITHUB_DB_URL,
  GITHUB_LATEST_RELEASE_API_URL,
} from "./db.js";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWin: BrowserWindow | null = null;
let splashWin: BrowserWindow | null = null;
let projectionWin: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

function getControlDisplay(): Display {
  const displays = screen.getAllDisplays();
  const internalDisplay = displays.find((display) => display.internal);
  return internalDisplay ?? screen.getPrimaryDisplay();
}

function placeWindowOnDisplay(
  win: BrowserWindow,
  targetDisplay: Display,
): void {
  const area = targetDisplay.workArea;
  win.setBounds({
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
  });
  win.maximize();
}

// function createSplashWindow() {
//   splashWin = new BrowserWindow({
//     width: 500,
//     height: 360,
//     frame: false,
//     resizable: false,
//     transparent: false,
//     center: true,
//     show: true,
//     skipTaskbar: true,
//     backgroundColor: "#1a1614",
//     icon: path.join(process.env.VITE_PUBLIC!, "hisv.png"),
//     webPreferences: { nodeIntegration: false, contextIsolation: true },
//   });
//   splashWin.loadFile(path.join(process.env.VITE_PUBLIC!, "splash.html"));
//   splashWin.on("closed", () => {
//     splashWin = null;
//   });
// }

async function createMainWindow() {
  // Prevent creating multiple windows
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.focus();
    return mainWin;
  }

  mainWin = new BrowserWindow({
    title: "Main window",
    frame: false,
    show: true,
    backgroundColor: "#212121",
    minWidth: 1000,
    minHeight: 800,
    icon: path.join(process.env.VITE_PUBLIC, "hisv.png"),
    webPreferences: {
      preload,
      // devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWin.loadURL(VITE_DEV_SERVER_URL);
    mainWin.setMenuBarVisibility(false);
    if (process.env.OPEN_DEVTOOLS === "true") {
      mainWin.webContents.openDevTools();
    }
  } else {
    mainWin.setMenuBarVisibility(false);
    mainWin.loadFile(indexHtml);
  }

  // Always place the control window on the internal display when available
  placeWindowOnDisplay(mainWin, getControlDisplay());

  // ── Splash window logic (commented out — re-enable if needed) ──────────────
  // let mainShown = false;
  // const showMain = () => {
  //   if (mainShown) return;
  //   mainShown = true;
  //   if (splashWin && !splashWin.isDestroyed()) splashWin.close();
  //   mainWin!.maximize();
  //   mainWin!.show();
  //   mainWin!.focus();
  // };
  // ipcMain.once("app-ready", showMain);
  // mainWin.webContents.once("dom-ready", () => { showMain(); });
  // setTimeout(showMain, 2000);

  // Handle keyboard shortcuts
  mainWin.webContents.on("before-input-event", (event, input) => {
    // In dev mode, allow F12 to toggle DevTools and Ctrl+R to reload
    if (VITE_DEV_SERVER_URL) {
      if (input.key === "F12") {
        event.preventDefault();
        if (mainWin && !mainWin.isDestroyed()) {
          if (mainWin.webContents.isDevToolsOpened()) {
            mainWin.webContents.closeDevTools();
          } else {
            mainWin.webContents.openDevTools();
          }
        }
        return;
      }

      // Allow Ctrl+R or Cmd+R for reload in dev mode
      if (
        (input.key === "R" || input.key === "r") &&
        (input.control || input.meta)
      ) {
        event.preventDefault();
        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.webContents.reload();
        }
        return;
      }
    }

    // Disable certain shortcuts in production
    if (
      (!VITE_DEV_SERVER_URL && input.key === "F12") || // Disable F12 in production
      (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
      (!VITE_DEV_SERVER_URL &&
        (input.key === "R" || input.key === "r") &&
        input.control) || // Disable Ctrl+R in production
      (!VITE_DEV_SERVER_URL &&
        (input.key === "R" || input.key === "r") &&
        input.meta) // Disable Cmd+R in production on macOS
    ) {
      event.preventDefault();
    }
  });

  // Handle window control IPC events
  ipcMain.removeAllListeners("minimizeApp");
  ipcMain.removeAllListeners("maximizeApp");
  ipcMain.removeAllListeners("closeApp");
  ipcMain.removeAllListeners("minimizeProjection");

  ipcMain.on("minimizeApp", () => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.minimize();
    }
  });

  ipcMain.on("maximizeApp", () => {
    if (mainWin && !mainWin.isDestroyed()) {
      if (mainWin.isMaximized()) {
        mainWin.unmaximize();
      } else {
        mainWin.maximize();
      }
    }
  });

  ipcMain.on("closeApp", () => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.close();
    }
  });

  ipcMain.on("minimizeProjection", () => {
    if (projectionWin && !projectionWin.isDestroyed()) {
      projectionWin.minimize();
    }
  });

  // Clean up when window is closed
  mainWin.on("closed", () => {
    mainWin = null;
    // Clean up IPC listeners when window is closed
    ipcMain.removeAllListeners("minimizeApp");
    ipcMain.removeAllListeners("maximizeApp");
    ipcMain.removeAllListeners("closeApp");
    ipcMain.removeAllListeners("minimizeProjection");
    ipcMain.removeAllListeners("get-system-fonts");
  });

  // IPC handler for getting system fonts
  ipcMain.handle("get-system-fonts", async () => {
    try {
      const fonts = await getSystemFonts();
      return fonts;
    } catch (error) {
      console.error("Error in get-system-fonts handler:", error);
      return [];
    }
  });

  // ── Branham API proxy (avoids renderer CORS) ───────────────────────────────
  ipcMain.handle(
    "branham:fetch",
    async (
      _event,
      endpoint: string,
      body: Record<string, unknown>,
    ): Promise<{
      ok: boolean;
      status: number;
      data?: unknown;
      error?: string;
    }> => {
      try {
        const res = await fetch(`https://table.branham.org/rest${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        return { ok: res.ok, status: res.status, data };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, status: 0, error: msg };
      }
    },
  );

  // ── DB IPC handlers ────────────────────────────────────────────────────────

  ipcMain.handle("db:status", () => ({
    exists: dbExists(),
    isPackaged: app.isPackaged,
    path: getDbPath(),
    downloadUrl: GITHUB_DB_URL,
    latestReleaseUrl: GITHUB_LATEST_RELEASE_API_URL,
    localRelease: getLocalDbReleaseMarker(),
  }));

  ipcMain.handle("db:check-update", () => checkDbUpdate());

  ipcMain.handle("db:get-sermons", () => {
    try {
      return getSermonsMeta();
    } catch (err) {
      console.error("db:get-sermons error:", err);
      return [];
    }
  });

  ipcMain.handle("db:get-sermon", (_event, id: string | number) => {
    try {
      return getSermonById(id) ?? null;
    } catch (err) {
      console.error("db:get-sermon error:", err);
      return null;
    }
  });

  ipcMain.handle(
    "db:search",
    (_event, payload: string | { query: string; mode?: "all" | "exact" }) => {
      const query = typeof payload === "string" ? payload : payload?.query;
      const mode = typeof payload === "string" ? "all" : payload?.mode;

      try {
        return searchSermons(query, mode === "exact" ? "exact" : "all");
      } catch (err) {
        console.error("db:search error:", err);
        return [];
      }
    },
  );

  ipcMain.handle("db:download", async (event) => {
    try {
      const latest = await fetchLatestDbRelease().catch(() => null);
      await downloadDb(
        latest?.downloadUrl ?? GITHUB_DB_URL,
        (progress) => {
          event.sender.send("db:download-progress", progress);
        },
        latest?.marker,
      );
      // Build heavier search structures locally after the lean DB is present.
      setTimeout(() => {
        const result = buildSearchIndex();
        event.sender.send("db:index-status", result);
      }, 0);
      return { success: true };
    } catch (err: any) {
      console.error("db:download error:", err);
      return { success: false, error: err?.message ?? String(err) };
    }
  });

  ipcMain.handle("db:build-search-index", () => buildSearchIndex());

  // ── EODH: list PDF files ─────────────────────────────────────────────────
  ipcMain.handle("eodh:list-pdfs", () => {
    // In dev:        APP_ROOT/resources/eodh  (process.resourcesPath points inside Electron binary)
    // In production: <install>/resources/eodh (extraResources copies to: "eodh")
    const devFolder        = path.join(process.env.APP_ROOT!, "resources", "eodh");
    const bundledFolder    = path.join(process.resourcesPath, "eodh");           // packaged
    const userFolder       = path.join(app.getPath("userData"), "eodh");         // user-added

    const hasPdfs = (folder: string) => {
      try {
        return fs.existsSync(folder) &&
               fs.readdirSync(folder).some((f) => f.toLowerCase().endsWith(".pdf"));
      } catch { return false; }
    };

    // Priority: user folder → bundled (packaged) → dev source folder
    let eodhFolder: string;
    if (hasPdfs(userFolder)) {
      eodhFolder = userFolder;
    } else if (hasPdfs(bundledFolder)) {
      eodhFolder = bundledFolder;
    } else if (hasPdfs(devFolder)) {
      eodhFolder = devFolder;
    } else {
      // Ensure the user folder exists so users can drop PDFs there
      try { fs.mkdirSync(userFolder, { recursive: true }); } catch {}
      eodhFolder = userFolder;
    }

    try {
      return fs
        .readdirSync(eodhFolder)
        .filter((f) => f.toLowerCase().endsWith(".pdf"))
        .sort()
        .map((f) => ({
          name:     f.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
          filename: f,
          path:     path.join(eodhFolder, f),
        }));
    } catch (err) {
      console.error("eodh:list-pdfs error:", err);
      return [];
    }
  });

  ipcMain.handle("eodh:read-pdf", (_event, filePath: string) => {
    try {
      return fs.readFileSync(filePath);
    } catch {
      return null;
    }
  });

  // ── EODH: open folder in explorer ───────────────────────────────────────
  ipcMain.handle("eodh:open-folder", () => {
    const bundledFolder = path.join(process.resourcesPath, "eodh");
    const userFolder    = path.join(app.getPath("userData"), "eodh");

    // Ensure user folder exists, then open it so users can add/remove PDFs
    try {
      fs.mkdirSync(userFolder, { recursive: true });
      shell.openPath(userFolder);
    } catch {
      try { shell.openPath(bundledFolder); } catch {}
    }
  });

  // Handle external links
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWin;
}

// App event handlers
app.whenReady().then(async () => {
  // createSplashWindow();
  await createMainWindow();
  if (mainWin) update(mainWin);

  const ensureControlWindowPlacement = () => {
    if (mainWin && !mainWin.isDestroyed()) {
      placeWindowOnDisplay(mainWin, getControlDisplay());
    }
  };

  screen.on("display-added", ensureControlWindowPlacement);
  screen.on("display-removed", ensureControlWindowPlacement);
  screen.on("display-metrics-changed", ensureControlWindowPlacement);

  // Handle app activation (macOS specific)
  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWin && !mainWin.isDestroyed()) {
      // Focus existing window if it exists
      mainWin.focus();
    }
  });
});

// Handle second instance attempt
app.on("second-instance", () => {
  // Someone tried to run a second instance, focus our window instead
  if (mainWin && !mainWin.isDestroyed()) {
    if (mainWin.isMinimized()) {
      mainWin.restore();
    }
    mainWin.focus();
  } else {
    // If window was closed, create a new one
    createMainWindow();
  }
});

// Ensure app quits when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, apps typically stay running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app before quit
app.on("before-quit", () => {
  closeDb();
  screen.removeAllListeners("display-added");
  screen.removeAllListeners("display-removed");
  screen.removeAllListeners("display-metrics-changed");
  // Clean up any resources before quitting
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.removeAllListeners();
  }
});

// Security: Prevent new window creation from renderer
// app.on("web-contents-created", (event, contents) => {
//   contents.setWindowOpenHandler(({ url }) => {
//     // Prevent new window creation
//     shell.openExternal(url);
//     return { action: "deny" };
//   });

//   contents.on("will-navigate", (event, navigationUrl) => {
//     const parsedUrl = new URL(navigationUrl);

//     // Allow navigation to same origin or dev server
//     if (
//       parsedUrl.origin !== VITE_DEV_SERVER_URL &&
//       parsedUrl.origin !== "file://"
//     ) {
//       event.preventDefault();
//       shell.openExternal(navigationUrl);
//     }
//   });
// });

// Export for testing or external access
export { createMainWindow, mainWin };
