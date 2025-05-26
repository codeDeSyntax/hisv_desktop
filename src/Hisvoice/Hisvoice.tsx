import React, { useState, Suspense, useEffect } from "react";
import SideNav from "./Sidebar";
import Home from "./Home";
// import CustomTitleBar from "./TitleBar";
import { useContext } from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import FontSettingsPage from "./Settings";
import Recents from "./Recents";
import QuotesManager from "./SavedQoutes";
import TitleBar from "@/shared/TitleBar";
import LoadingScreen from "./Loading";
import BookmarksPage from "./Bookmark";

// Lazy-loaded components
const Gallery = React.lazy(() => import("./Media"));
const SermonList = React.lazy(() => import("./Allsermons"));
const SelectedSermon = React.lazy(() => import("./SelectedSermon"));
const DeveloperPage = React.lazy(() => import("./Developer"));

const Hisvoice = () => {
  // const [isCollapsed, setIsCollapsed] = useState(true);
  const { activeTab, isCollapsed, setIsCollapsed, theme } = useSermonContext();
  const [background, setBackground] = useState(false);

  // Apply theme to document

  return (
    <div
      className="h-screen overflow-hidden no-scrollbar bg-white dark:bg-background"
      id="hisvoicediv"
    >
      <TitleBar />
      <div className={`h-full `}>
        <div className="  ">
          {/* <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> */}

          {/* Main content */}
          <div className=" ">
            {activeTab === "home" ? (
              <Home />
            ) : activeTab === "sermons" ? (
              <Suspense fallback={<LoadingScreen />}>
                <SermonList />
              </Suspense>
            ) : activeTab === "message" ? (
              <Suspense fallback={<LoadingScreen />}>
                <SelectedSermon
                  background={background}
                  setBackground={setBackground}
                />
              </Suspense>
            ) : activeTab === "settings" ? (
              <FontSettingsPage />
            ) : activeTab === "recents" ? (
              <Recents />
            ) : activeTab === "about" ? (
              <Suspense fallback={<LoadingScreen />}>
                <DeveloperPage />
              </Suspense>
            ) : activeTab === "media" ? (
              <Suspense fallback={<LoadingScreen />}>
                <Gallery />
              </Suspense>
            ) : activeTab === "quotes" ? (
              <QuotesManager />
            ) : activeTab === "bookmarks" ? (
              <Suspense fallback={<LoadingScreen />}>
                <BookmarksPage />
              </Suspense>
            ) : (
              "none"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hisvoice;
