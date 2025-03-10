import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BmusicProvider } from "./Provider/Bmusic";

import "./index.css";
import InstrumentShowroom from "./vmusic/InstrumentShowRoom";

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BmusicProvider>
      <InstrumentShowroom />k
    </BmusicProvider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
