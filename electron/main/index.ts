
import { app, BrowserWindow, shell, ipcMain ,dialog} from "electron";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { update } from "./update";
import { PDFDocument,StandardFonts } from "pdf-lib";
import { getDocument } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";



// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";


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

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    frame: false,
    minWidth: 1000,  // minimum width
    minHeight: 800, // minimum height
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: false,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    win.maximize();
    win.setMenuBarVisibility(false);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.maximize();
    win.setMenuBarVisibility(false);
    win.loadFile(indexHtml);
  }

  ipcMain.on("minimizeApp", () => {
    win?.minimize();
  });
  ipcMain.on("maximizeApp", () => {
    if (win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });
  ipcMain.on("closeApp", () => {
    win?.close();
  });

  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!result.canceled) {
      console.log(result.filePaths[0])
      return result.filePaths[0]; // Return the selected directory path
    }
    return null;
  });

  ipcMain.handle("save-song", async (event, { directory, title, content }) => {
    try {
      // Create a new PDFDocument
      const pdfDoc = await PDFDocument.create();
      
      // Define page margin, font size, and text width limits
      const fontSize = 12;
      const margin = 50;
      const lineHeight = fontSize * 1.5; // Line height multiplier for better readability
  
      // Function to split text into lines based on page width
      const wrapText = (text: string, maxWidth: number, page: any, font: any) => {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
  
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + (currentLine.length > 0 ? ' ' : '') + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
  
        lines.push(currentLine); // Push the last line
        return lines;
      };
  
      // Add a new page to the PDF document
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const maxTextWidth = width - 2 * margin; // Account for margins
  
      // Set the font and measure text for wrapping
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let yPosition = height - margin;
  
      const paragraphs = content.split('\n'); // Split content by paragraph (newlines)
  
      for (let paragraph of paragraphs) {
        const lines = wrapText(paragraph, maxTextWidth, page, font);
  
        for (let line of lines) {
          if (yPosition - lineHeight < margin) {
            // Add a new page if there's no room left on the current page
            page = pdfDoc.addPage();
            yPosition = height - margin;
          }
  
          // Draw the text line on the page
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
          });
  
          // Move the y-position down for the next line
          yPosition -= lineHeight;
        }
  
        // Add extra spacing between paragraphs
        yPosition -= lineHeight;
      }
  
      // Serialize the PDFDocument to bytes (Uint8Array)
      const pdfBytes = await pdfDoc.save();
  
      // Define the ile path
      const filePath = path.join(directory, `${title}.pdf`);
  
      // Write the PDF file to the file system
      fs.writeFileSync(filePath, pdfBytes);
  
      return filePath; // Return the file path if successful
    } catch (error) {
      console.error("Error saving song as PDF:", error);
      throw error; // Handle or throw the error as needed
    }
  });
  
  // Handle fetching songs from a directory
  ipcMain.handle("fetch-songs", async (event, directory) => {
    try {
      const files = fs.readdirSync(directory);
  
      // Fetch details for each PDF file
      const songs = await Promise.all(
        files
          .filter((file: string) => file.endsWith(".pdf"))
          .map(async (file: string) => {
            const filePath = path.join(directory, file);
            const fileStats = fs.statSync(filePath); // Get file details including modification date
            const fileContent = await extractPDFContent(filePath); // Ensure this returns the extracted text
  
            return {
              title: path.basename(file, ".pdf"),
              path: filePath,
              content: fileContent || "", // Safeguard against undefined content
              dateModified: fileStats.mtime.toISOString(), // Date modified of the file
            };
          })
      );
      
      console.log("fetched songs", songs);
      return songs; // Return the array of songs
    } catch (error) {
      console.error("Error fetching songs:", error);
      throw new Error("Failed to fetch songs.");
    }
  });
  
  const extractPDFContent = async (filePath: string): Promise<string> => {
    try {
      // Read the PDF file as Buffer
      const pdfBuffer = fs.readFileSync(filePath);
  
      // Convert Buffer to Uint8Array
      const pdfBytes = new Uint8Array(pdfBuffer);
  
      // Load the PDF document using pdf.js
      const loadingTask = getDocument({ data: pdfBytes });
      const pdfDoc = await loadingTask.promise;
  
      // Extract text from each page
      let content = "";
      for (let i = 0; i < pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i + 1);
        const textContent = await page.getTextContent();
        content += textContent.items.map((item: any) => item.str).join(" ");
      }
  
      return content;
    } catch (error) {
      console.error("Error extracting PDF content:", error);
      return ""; // Return an empty string if there's an error
    }
  };

  ipcMain.handle('edit-song', async (event, { directory, newTitle, content, originalPath }) => {
    try {
      // Load existing PDF file if it exists
      const fileExists = fs.existsSync(originalPath);
      let pdfDoc;
  
      if (fileExists) {
        const existingPdfBytes = fs.readFileSync(originalPath);
        pdfDoc = await PDFDocument.load(existingPdfBytes);
      } else {
        pdfDoc = await PDFDocument.create(); // Create a new PDF if no file exists
      }
  
      // Modify content in the existing PDF
      let page = pdfDoc.getPage(0) || pdfDoc.addPage(); // Get first page or add a new one
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const margin = 50;
      const lineHeight = fontSize * 1.5;
      const paragraphs = content.split('\n');
      let yPosition = height - margin;
  
      // Clear existing text (if you want to overwrite) or draw over it
      page = pdfDoc.addPage(); // Add a new page to overwrite
  
      for (let paragraph of paragraphs) {
        const lines = wrapText(paragraph, width - 2 * margin, page, font);
        for (let line of lines) {
          if (yPosition - lineHeight < margin) {
            page = pdfDoc.addPage(); // Add new page if necessary
            yPosition = height - margin;
          }
          page.drawText(line, { x: margin, y: yPosition, size: fontSize, font });
          yPosition -= lineHeight;
        }
        yPosition -= lineHeight;
      }
  
      // Handle renaming the file if the title changes
      const newFilePath = path.join(directory, `${newTitle}.pdf`);
  
      if (newTitle && newFilePath !== originalPath) {
        if (fileExists && fs.existsSync(originalPath)) {
          fs.renameSync(originalPath, newFilePath); // Rename the file
        }
      }
  
      // Save the updated PDF
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(newFilePath, pdfBytes);
  
      return newFilePath; // Return the new file path if successful
    } catch (error) {
      console.error('Error editing song:', error);
      throw error;
    }
  });

  ipcMain.handle("search-songs", async (event, directory, searchTerm) => {
    try {
      const files = fs.readdirSync(directory);
  
      // Fetch details for each PDF file and filter by search term
      const matchedSongs = await Promise.all(
        files
          .filter((file) => file.endsWith(".pdf"))
          .map(async (file) => {
            const filePath = path.join(directory, file);
            const fileStats = fs.statSync(filePath); // Get file details including modification date
            const fileContent = await extractPDFContent(filePath); // Ensure this returns the extracted text
  
            // If the song content matches the search term, include it
            if (fileContent && fileContent.toLowerCase().includes(searchTerm.toLowerCase())) {
              return {
                title: path.basename(file, ".pdf"),
                path: filePath,
                content: fileContent || "", // Safeguard against undefined content
                dateModified: fileStats.mtime.toISOString(), // Date modified of the file
              };
            }
            return null; // Return null if no match
          })
      );
  
      // Filter out null values from the array
      const filteredSongs = matchedSongs.filter((song) => song !== null);
  
      console.log("searched songs", filteredSongs);
      return filteredSongs; // Return the array of matched songs
    } catch (error) {
      console.error("Error searching songs:", error);
      throw new Error("Failed to search songs.");
    }
  });
  

  ipcMain.handle('delete-song', async (event, filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Remove the file
        return true; // Return success
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  });
  
  // Function to get the first four images from the specified directory
  function getPresentationImages(directoryPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        // Check if the directory exists
        fs.access(directoryPath, fs.constants.F_OK, (err) => {
            if (err) {
                return reject(new Error(`Directory not found: ${directoryPath}`));
            }
  
            // Read the directory
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    return reject(new Error(`Error reading directory: ${err.message}`));
                }
  
                // Filter only image files (png, jpg, jpeg, etc.)
                const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
                const imageFiles = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));
  
                // Return only the first four images
                const firstFourImages = imageFiles.slice(0, 4).map(file => {
                  // Convert file path to file URL format
                  const fileUrl = `file:///${path.join(directoryPath, file).replace(/\\/g, '/')}`;
                  return fileUrl;
                });
  
                if (firstFourImages.length === 0) {
                    return reject(new Error('No images found in the directory.'));
                }
  
                resolve(firstFourImages);
            });
        });
    });
  }

// Listen for IPC message from renderer process to fetch images
ipcMain.handle('get-presentation-images', async (event, directoryPath) => {
  try {
      const images = await getPresentationImages(directoryPath);
      return images;
  } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      } else {
        return { error: String(error) };
      }
  }
});
  // Utility function for text wrapping
  function wrapText(text: string, maxWidth: number, page: any, font: any) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
  
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + (currentLine.length > 0 ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, 12);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
  


  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Auto update
  update(win);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   })

//   if (VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
//   } else {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   }
// })
