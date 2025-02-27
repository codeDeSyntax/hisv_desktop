import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import fs from "node:fs";
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
let projectionWin: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const projectionHtml = path.join(RENDERER_DIST, "projection.html");

async function createMainWindow() {
  mainWin = new BrowserWindow({
    title: "Main window",
    frame: false,
    minWidth: 1000,
    minHeight: 800,
    icon: path.join(process.env.VITE_PUBLIC, "music2.png"),
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

  ipcMain.on("minimizeApp", () => {
    mainWin?.minimize();
  });
  ipcMain.on("maximizeApp", () => {
    if (mainWin?.isMaximized()) {
      mainWin?.unmaximize();
    } else {
      mainWin?.maximize();
    }
  });
  ipcMain.on("closeApp", () => {
    mainWin?.close();
  });

  return mainWin;
}

async function createProjectionWindow() {
  // Check if projection window already exists, if not create it
  if (!projectionWin) {
    projectionWin = new BrowserWindow({
      title: "Projection",
      frame: false,
      modal: true, // Optional: makes the child window modal
      show: true,
      fullscreen: true,
      icon: path.join("./dist/", "music2.png"),
      webPreferences: {
        preload,
        devTools: false,
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    if (VITE_DEV_SERVER_URL) {
      projectionWin.loadURL(`${VITE_DEV_SERVER_URL}/projection.html`);
    } else {
      projectionWin.loadFile(projectionHtml);
    }
  }

  projectionWin.webContents.on("before-input-event", (event, input) => {
    if (
      input.key === "F12" || // Disable F12 for dev tools
      (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
      (input.key === "R" && input.control) || // Disable Ctrl+R for reload
      (input.key === "R" && input.meta) // Disable Cmd+R for reload on macOS
    ) {
      event.preventDefault();
    }
  });

  return projectionWin;
}

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Ensure app quits when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("project-song", (event, songData) => {
  console.log(songData);

  // Check if projection window exists and has not been destroyed
  if (projectionWin && !projectionWin.isDestroyed()) {
    // If projectionWin exists and is not destroyed, send the song data
    projectionWin.webContents.send("display-song", songData);
    projectionWin?.focus();
  } else {
    // If projectionWin doesn't exist or has been destroyed, create it again
    createProjectionWindow().then(() => {
      projectionWin?.once("ready-to-show", () => {
        // Once the window is ready, send the song data
        projectionWin?.webContents.send("display-song", songData);
        projectionWin?.focus();
      });
    });
  }
});

// Handle selecting a directory via the file dialog
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

// Handle saving a song as a text file
ipcMain.handle("save-song", async (event, { directory, title, content }) => {
  try {
    const filePath = path.join(directory, `${title}.txt`);
    fs.writeFileSync(filePath, content, "utf8");
    return filePath;
  } catch (error) {
    console.error("Error saving song:", error);
    throw error;
  }
});

// Handle fetching songs from a directory
ipcMain.handle("fetch-songs", async (event, directory) => {
  try {
    const files = fs.readdirSync(directory);
    const songs = await Promise.all(
      files
        .filter((file) => file.endsWith(".txt"))
        .map(async (file, index) => {
          const filePath = path.join(directory, file);
          const fileStats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf8");

          return {
            id: `bmusic${index + 1}`,
            title: path.basename(file, ".txt"),
            path: filePath,
            content,
            dateModified: fileStats.mtime.toISOString(),
          };
        })
    );
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw new Error("Failed to fetch songs.");
  }
});

// Handle editing an existing song or renaming it
ipcMain.handle(
  "edit-song",
  async (event, { directory, newTitle, content, originalPath }) => {
    try {
      const fileExists = fs.existsSync(originalPath);

      if (fileExists) {
        fs.writeFileSync(originalPath, content, "utf8");
      } else {
        fs.writeFileSync(originalPath, content, "utf8");
      }

      const newFilePath = path.join(directory, `${newTitle}.txt`);
      if (newTitle && newFilePath !== originalPath) {
        if (fileExists && fs.existsSync(originalPath)) {
          fs.renameSync(originalPath, newFilePath);
        }
      }

      return newFilePath;
    } catch (error) {
      console.error("Error editing song:", error);
      throw error;
    }
  }
);

// Handle deleting a song
ipcMain.handle("delete-song", async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    console.error("Error deleting song:", error);
    throw error;
  }
});
