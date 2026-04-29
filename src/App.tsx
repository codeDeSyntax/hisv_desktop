import React, { useState, useEffect } from "react";
import Hisvoice from "./Hisvoice/Hisvoice";
import FloatingButton from "./components/ButtonFloat";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTheme } from "./Provider/Theme";
import { useSermonContext } from "./Provider/Vsermons";

const App = () => {
  const {
    activeTab,
    setActiveTab,
    prevScreen,
    loading,
    dbStatus,
    loadingMessage,
    downloadProgress,
    error,
    startDbDownload,
    handleClose,
  } = useSermonContext();
  const [showShortcutsToast, setShowShortcutsToast] = useState(false);

  const showDbOverlay = dbStatus === "missing" || dbStatus === "downloading";

  // Signal main process when data is ready — closes splash and shows main window
  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.ipcRenderer.send("app-ready");
        });
      });
    }
  }, [loading]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field or textarea
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.getAttribute("contenteditable") === "true";

      // Don't trigger shortcuts if typing in input fields
      if (isInputFocused) return;

      if (event.ctrlKey || event.metaKey) {
        // Only preventDefault for keys this handler actually handles.
        // Let browser defaults (Ctrl+C, Ctrl+V, Ctrl+A, etc.) pass through.
        const key = event.key.toLowerCase();

        switch (key) {
          case "h":
            event.preventDefault();
            setActiveTab("home");
            showToast("🏠 Home");
            break;
          case "b":
            event.preventDefault();
            setActiveTab("bookmarks");
            showToast("🔖 Bookmarks");
            break;
          case "r":
            event.preventDefault();
            setActiveTab("recents");
            showToast("🕒 Recent Sermons");
            break;
          case "m":
            event.preventDefault();
            setActiveTab("message");
            showToast("📖 Reading Mode");
            break;
          case "s":
            event.preventDefault();
            setActiveTab("sermons");
            showToast("📚 All Sermons");
            break;
          case "p":
          case ",":
            event.preventDefault();
            setActiveTab("settings");
            showToast("⚙️ Settings");
            break;
          case "/":
          case "k":
            event.preventDefault();
            const searchInput = document.querySelector(
              'input[placeholder*="search" i], input[placeholder*="Search" i]',
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              searchInput.select();
              showToast("🔍 Search Mode");
            }
            break;
          case "?":
            event.preventDefault();
            setShowShortcutsToast(true);
            setTimeout(() => setShowShortcutsToast(false), 5000);
            break;
          default:
            // Don't preventDefault — let Ctrl+C, Ctrl+V, Ctrl+A, etc. work normally
            break;
        }
      }
    };

    const showToast = (message: string) => {
      // Create temporary toast notification
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
      toast.style.transform = "translateX(100%)";
      toast.innerHTML = message;
      document.body.appendChild(toast);

      // Animate in
      setTimeout(() => {
        toast.style.transform = "translateX(0)";
      }, 10);

      // Animate out and remove
      setTimeout(() => {
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 2000);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setActiveTab]);

  return (
    <div
      className={`flex flex-col h-screen w-screen thin-scrollbar no-scrollbar bg-white dark:bg-ltzinc overflow-hidden`}
      style={{ fontFamily: "Palatino" }}
    >
      <Hisvoice />

      {/* Keyboard Shortcuts Help Toast */}
      {showShortcutsToast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 m-4 max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-200">
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + H
                  </kbd>
                </span>
                <span>Home</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + B
                  </kbd>
                </span>
                <span>Bookmarks</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + R
                  </kbd>
                </span>
                <span>Recent Sermons</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + M
                  </kbd>
                </span>
                <span>Reading Mode</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + S
                  </kbd>
                </span>
                <span>All Sermons</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + ,
                  </kbd>
                </span>
                <span>Settings</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + K
                  </kbd>
                </span>
                <span>Search</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + ?
                  </kbd>
                </span>
                <span>Show This Help</span>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutsToast(false)}
              className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* {activeTab !== "home" && (
        <FloatingButton
          icon={<ArrowLeftOutlined />}
          position="bottom-left"
          onClick={() => setActiveTab(prevScreen)}
        />
      )} */}

      {showDbOverlay && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl p-6 sm:p-7">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {dbStatus === "downloading"
                  ? "Preparing your sermon library"
                  : "Sermon Library Needed"}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {dbStatus === "downloading"
                  ? "Please keep this window open while we download your sermon library."
                  : "To start reading and searching sermons, download the library once. It will be saved on this device for future use."}
              </p>
            </div>

            {dbStatus === "downloading" && (
              <div className="mb-5">
                <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(2, Math.min(100, downloadProgress))}%`,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  {loadingMessage || `Downloading… ${downloadProgress}%`}
                </p>
              </div>
            )}

            {error && dbStatus !== "downloading" && (
              <p className="mb-4 text-sm text-rose-500 text-center">{error}</p>
            )}

            {dbStatus !== "downloading" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => void startDbDownload()}
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  Download Sermon Library
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Close App
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
