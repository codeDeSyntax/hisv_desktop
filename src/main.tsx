// ── ReadableStream async-iterator polyfill ────────────────────────────────────
// PDF.js v6 uses `for await (const chunk of readableStream)` internally.
// Electron's renderer ships a ReadableStream without Symbol.asyncIterator,
// which causes "readableStream is not async iterable" in getTextContent().
if (
  typeof ReadableStream !== "undefined" &&
  !(ReadableStream.prototype as any)[Symbol.asyncIterator]
) {
  (ReadableStream.prototype as any)[Symbol.asyncIterator] = async function* () {
    const reader = (this as ReadableStream).getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  };
}
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

import ReactDOM from "react-dom/client";
import App from "./App";
import { SermonProvider } from "./Provider/Vsermons";

import "./index.css";
import { ThemeProvider } from "./Provider/Theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SermonProvider>
        <App />
      </SermonProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
