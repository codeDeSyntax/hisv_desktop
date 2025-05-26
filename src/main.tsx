import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SermonProvider } from "./Provider/Vsermons";

import "./index.css";
import { ThemeProvider } from "./Provider/Theme";

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SermonProvider>
        <App />
      </SermonProvider>
    </ThemeProvider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
