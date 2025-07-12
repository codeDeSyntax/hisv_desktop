import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

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
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createMainWindow() {
  // Prevent creating multiple windows
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.focus();
    return mainWin;
  }

  mainWin = new BrowserWindow({
    title: "Main window",
    frame: false,
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
    mainWin.maximize();
    mainWin.setMenuBarVisibility(false);
    mainWin.webContents.openDevTools();
  } else {
    mainWin.maximize();
    mainWin.setMenuBarVisibility(false);
    mainWin.loadFile(indexHtml);
  }

  // Disable certain keyboard shortcuts
  mainWin.webContents.on("before-input-event", (event, input) => {
    if (
      input.key === "F12" || // Disable F12 for dev tools
      (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
      (input.key === "R" && input.control) || // Disable Ctrl+R for reload
      (input.key === "R" && input.meta) // Disable Cmd+R for reload on macOS
    ) {
      event.preventDefault();
    }
  });

  // Handle window control IPC events
  ipcMain.removeAllListeners("minimizeApp");
  ipcMain.removeAllListeners("maximizeApp");
  ipcMain.removeAllListeners("closeApp");

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

  // Clean up when window is closed
  mainWin.on("closed", () => {
    mainWin = null;
    // Clean up IPC listeners when window is closed
    ipcMain.removeAllListeners("minimizeApp");
    ipcMain.removeAllListeners("maximizeApp");
    ipcMain.removeAllListeners("closeApp");
  });

  // Handle external links
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWin;
}

// App event handlers
app.whenReady().then(() => {
  createMainWindow();

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