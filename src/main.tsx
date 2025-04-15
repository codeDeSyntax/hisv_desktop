import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BmusicProvider } from "./Provider/Bmusic";
import { SermonProvider } from "./Provider/Vsermons";
import { EastVoiceProvider } from "./Provider/EastVoice";

import "./index.css";
import { BibleProvider } from "./Provider/Bible";
import { EvPresentationProvider } from "./Provider/EvPresent";
import { ThemeProvider } from "./Provider/Theme";

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <EastVoiceProvider>
        <EvPresentationProvider>
          <BmusicProvider>
            <SermonProvider>
              <BibleProvider>
                <App />
              </BibleProvider>
            </SermonProvider>
          </BmusicProvider>
        </EvPresentationProvider>
      </EastVoiceProvider>
    </ThemeProvider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
