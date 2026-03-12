import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { RefreshCw } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

type UpdatePayload =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "downloading"; version?: string; percent: number }
  | { status: "ready"; version: string }
  | { status: "up-to-date" }
  | { status: "error"; message: string };

export default function UpdateManager() {
  const btnRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [update, setUpdate] = useState<UpdatePayload>({ status: "idle" });
  const [autoUpdate, setAutoUpdate] = useState(false);
  const { accentColor } = useTheme();

  // Load preference & subscribe to update events on mount
  useEffect(() => {
    window.ipcRenderer
      .invoke("get-update-preference")
      .then((prefs: { autoUpdate: boolean }) =>
        setAutoUpdate(prefs?.autoUpdate ?? false),
      )
      .catch(() => {});

    const handler = (_e: unknown, payload: UpdatePayload) => setUpdate(payload);

    window.ipcRenderer.on("update-status", handler);
    return () => {
      window.ipcRenderer.off("update-status", handler as never);
    };
  }, []);

  // Click-outside closes the panel
  useEffect(() => {
    if (!show) return;
    const onDoc = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [show]);

  const toggleAutoUpdate = useCallback(async () => {
    const next = !autoUpdate;
    setAutoUpdate(next);
    await window.ipcRenderer
      .invoke("set-update-preference", { autoUpdate: next })
      .catch(() => {});
  }, [autoUpdate]);

  const checkUpdate = useCallback(() => {
    window.ipcRenderer.invoke("check-update").catch(() => {});
  }, []);

  const downloadUpdate = useCallback(() => {
    window.ipcRenderer.invoke("download-update").catch(() => {});
  }, []);

  const installNow = useCallback(() => {
    window.ipcRenderer.invoke("quit-and-install").catch(() => {});
  }, []);

  // Panel anchored to button
  const getPanelStyle = (): React.CSSProperties => {
    if (!btnRef.current) return {};
    const rect = btnRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      zIndex: 9999,
    };
  };

  const hasDot =
    update.status === "available" ||
    update.status === "downloading" ||
    update.status === "ready";

  const appVersion =
    typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "—";

  const panel = show
    ? ReactDOM.createPortal(
        <div
          ref={panelRef}
          style={getPanelStyle()}
          className="w-72 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-zinc-900 dark:text-zinc-100 text-sm select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-base">Updates</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              v{appVersion}
            </span>
          </div>

          {/* Status area */}
          <div className="mb-3 min-h-[28px] flex items-center gap-2">
            {update.status === "idle" && (
              <span className="text-zinc-400 dark:text-zinc-500">
                Press check to look for updates.
              </span>
            )}
            {update.status === "checking" && (
              <>
                <RefreshCw
                  className="w-3.5 h-3.5 animate-spin"
                  style={{ color: accentColor }}
                />
                <span>Checking for updates…</span>
              </>
            )}
            {update.status === "up-to-date" && (
              <span className="text-green-600 dark:text-green-400">
                You're up to date!
              </span>
            )}
            {update.status === "available" && (
              <span className="text-amber-600 dark:text-amber-400">
                v
                {
                  (update as Extract<UpdatePayload, { status: "available" }>)
                    .version
                }{" "}
                available
              </span>
            )}
            {update.status === "downloading" && (
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span>Downloading…</span>
                  <span>
                    {(
                      update as Extract<
                        UpdatePayload,
                        { status: "downloading" }
                      >
                    ).percent ?? 0}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(update as Extract<UpdatePayload, { status: "downloading" }>).percent ?? 0}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>
            )}
            {update.status === "ready" && (
              <span style={{ color: accentColor }}>
                v
                {
                  (update as Extract<UpdatePayload, { status: "ready" }>)
                    .version
                }{" "}
                ready to install
              </span>
            )}
            {update.status === "error" && (
              <span className="text-red-500 text-xs truncate">
                {
                  (update as Extract<UpdatePayload, { status: "error" }>)
                    .message
                }
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {(update.status === "idle" ||
              update.status === "up-to-date" ||
              update.status === "error") && (
              <button
                onClick={checkUpdate}
                className="w-full py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors text-xs font-medium"
              >
                Check for Updates
              </button>
            )}
            {update.status === "available" && (
              <button
                onClick={downloadUpdate}
                className="w-full py-1.5 rounded-lg text-white transition-colors text-xs font-medium"
                style={{ backgroundColor: accentColor }}
              >
                Download Update
              </button>
            )}
            {update.status === "ready" && (
              <button
                onClick={installNow}
                className="w-full py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-xs font-medium"
              >
                Install &amp; Restart
              </button>
            )}

            {/* Auto-update toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-700">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Auto-download updates
              </span>
              <button
                onClick={toggleAutoUpdate}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  autoUpdate
                    ? "bg-zinc-300 dark:bg-zinc-600"
                    : "bg-zinc-300 dark:bg-zinc-600"
                }
                style={{ backgroundColor: autoUpdate ? accentColor : undefined }}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    autoUpdate ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        ref={btnRef}
        onClick={() => setShow((s) => !s)}
        className="relative w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-primary"
      >
        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-accent group-hover:text-black dark:group-hover:text-white" />
        {hasDot && (
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
        )}
      </div>
      {panel}
    </>
  );
}
