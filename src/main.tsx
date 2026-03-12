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
