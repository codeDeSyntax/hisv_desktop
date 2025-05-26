import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowLeftCircle } from "lucide-react";
import Hisvoice from "./Hisvoice/Hisvoice";
import FloatingButton from "./components/ButtonFloat";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTheme } from "./Provider/Theme";
import { useSermonContext } from "./Provider/Vsermons";

const App = () => {
  const { activeTab, setActiveTab, prevScreen } = useSermonContext();

  // Mock song data for demonstration
  // const allSongs: Song[] = new Array(100).fill(null).map((_, index) => ({
  //   id: index + 1,
  //   title: `Song ${index + 1}`,
  // }));

  // set up key combinations to navigate between screens
  // ctrl + H ---- Home
  // ctrl + B ---- Bible
  // ctrl + W ---- Hisvoice
  // ctrl + P ---- Presenter
  // ctrl + S ---- Songs

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.ctrlKey) {
  //       switch (event.key) {
  //         case "h":
  //           setCurrentScreen("Home");
  //           break;
  //         case "b":
  //           setCurrentScreen("bible");
  //           break;
  //         case "l":
  //           setCurrentScreen("hisvoice");
  //           break;
  //         case "p":
  //           setCurrentScreen("mpresenter");
  //           break;
  //         case "s":
  //           setCurrentScreen("Songs");
  //         // case "m":
  //         //   setCurrentScreen("mpresenter");
  //         //   break;
  //         default:
  //           break;
  //       }
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);
  return (
    <div
      className={`flex flex-col h-screen w-screen thin-scrollbar no-scrollbar bg-white dark:bg-ltgray overflow-hidden`}
      style={{ fontFamily: "Palatino" }}
    >
      <Hisvoice />
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
