import React, { useState } from "react";
import {
  Menu,
  FileText,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ArrowLeftCircle,
} from "lucide-react";
import BlessedMusic from "./components/BlessedMusic";
import EditSong from "./components/EditForm";
import WorkspaceSelector from "./components/Welcome";
import CreateSong from "./components/Form";
import SongPresentation from "./components/PresentationMode";
import { useBmusicContext } from "./Provider/Bmusic";
import InstrumentShowroom from "./components/InstrumentShowRoom";
import SongCollectionManager from "./components/Categorize";

const App = () => {
  const { currentScreen, setCurrentScreen } = useBmusicContext();

  // Mock song data for demonstration
  // const allSongs: Song[] = new Array(100).fill(null).map((_, index) => ({
  //   id: index + 1,
  //   title: `Song ${index + 1}`,
  // }));

  return (
    <div
      className={`flex flex-col h-screen w-screen thin-scrollbar no-scrollbar bg-[#292a2d]`}
    >
      {/* <BlessedMusic /> */}
      {currentScreen === "Home" ? (
        <WorkspaceSelector />
      ) : currentScreen === "create" ? (
        <CreateSong />
      ) : currentScreen === "Songs" ? (
        <BlessedMusic />
      ) : currentScreen === "edit" ? (
        <EditSong />
      ) : currentScreen === "Presentation" ? (
        <SongPresentation />
      ) : currentScreen === "instRoom" ? (
        <InstrumentShowroom />
      ) : currentScreen === "categorize" ? (
        <SongCollectionManager />
      ) : (
        <ArrowLeftCircle
          className="size-6 text-white"
          onClick={() => setCurrentScreen("Home")}
        />
      )}
      {/* <SongPresentation/> */}
    </div>
  );
};

export default App;
