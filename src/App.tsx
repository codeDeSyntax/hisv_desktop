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
import BlessedMusic from "./vmusic/BlessedMusic";
import EditSong from "./vmusic/EditForm";
import WorkspaceSelector from "./vmusic/Welcome";
import CreateSong from "./vmusic/Form";
import SongPresentation from "./vmusic/PresentationMode";
import { useBmusicContext } from "./Provider/Bmusic";
import InstrumentShowroom from "./vmusic/InstrumentShowRoom";
import SongCollectionManager from "./vmusic/Categorize";
import UserGuidePage from "./vmusic/Userguide";
import PresentationBackgroundSelector from "./vmusic/BackgroundChoose";
import Hisvoice from "./Hisvoice/Hisvoice";
import BibleApp from "./Bible/Bible";
import Biblelayout from './Bible/Bible';
import { useEastVoiceContext } from "./Provider/EastVoice";

const App = () => {
  const { currentScreen, setCurrentScreen } = useEastVoiceContext();

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
      ) : currentScreen === "userguide" ? (
        <UserGuidePage />
      ) : currentScreen === "backgrounds" ? (
        <PresentationBackgroundSelector />
      ) : currentScreen === "hisvoice" ? (
        <Hisvoice/> 
      ) : currentScreen === "bible" ? (
        <Biblelayout/>
      ):
       (
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
