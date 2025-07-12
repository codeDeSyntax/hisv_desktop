import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowLeftCircle } from "lucide-react";
import Hisvoice from "./Hisvoice/Hisvoice";
import FloatingButton from "./components/ButtonFloat";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTheme } from "./Provider/Theme";
import { useSermonContext } from "./Provider/Vsermons";

const App = () => {
  const { activeTab, setActiveTab, prevScreen } = useSermonContext();
  const [showShortcutsToast, setShowShortcutsToast] = useState(false);

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
        // Support both Ctrl (Windows/Linux) and Cmd (Mac)
        event.preventDefault();

        switch (event.key.toLowerCase()) {
          case "h":
            setActiveTab("home");
            showToast("🏠 Home");
            break;
          case "b":
            setActiveTab("bookmarks");
            showToast("🔖 Bookmarks");
            break;
          case "r":
            setActiveTab("recents");
            showToast("🕒 Recent Sermons");
            break;
          case "m":
            setActiveTab("message");
            showToast("📖 Reading Mode");
            break;
          case "s":
            setActiveTab("sermons");
            showToast("📚 All Sermons");
            break;
          case "p":
          case ",": // Cmd+, is common for preferences/settings
            setActiveTab("settings");
            showToast("⚙️ Settings");
            break;
          case "/":
          case "k": // Cmd+K is common for search
            // Focus search if available
            const searchInput = document.querySelector(
              'input[placeholder*="search" i], input[placeholder*="Search" i]'
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              searchInput.select();
              showToast("🔍 Search Mode");
            }
            break;
          case "?":
            // Show keyboard shortcuts help
            setShowShortcutsToast(true);
            setTimeout(() => setShowShortcutsToast(false), 5000);
            break;
          default:
            break;
        }
      }
    };

    const showToast = (message: string) => {
      // Create temporary toast notification
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 bg-stone-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
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
      className={`flex flex-col h-screen w-screen thin-scrollbar no-scrollbar bg-white dark:bg-ltgray overflow-hidden`}
      style={{ fontFamily: "Palatino" }}
    >
      <Hisvoice />

      {/* Keyboard Shortcuts Help Toast */}
      {showShortcutsToast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 m-4 max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-stone-800 dark:text-stone-200">
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + H
                  </kbd>
                </span>
                <span>Home</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + B
                  </kbd>
                </span>
                <span>Bookmarks</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + R
                  </kbd>
                </span>
                <span>Recent Sermons</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + M
                  </kbd>
                </span>
                <span>Reading Mode</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + S
                  </kbd>
                </span>
                <span>All Sermons</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + ,
                  </kbd>
                </span>
                <span>Settings</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
                    Ctrl/Cmd + K
                  </kbd>
                </span>
                <span>Search</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <kbd className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded text-xs">
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
    </div>
  );
};

export default App;
