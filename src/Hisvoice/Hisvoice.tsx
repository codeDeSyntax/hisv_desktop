import React, { useState, Suspense, useEffect } from "react";
import SideNav from "./Sidebar";
import Home from "./Home";
// import CustomTitleBar from "./TitleBar";
import { useContext } from "react";
import { useSermonContext } from "@/Provider/Vsermons";
import FontSettingsPage from "./Settings";
import QuotesManager from "./SavedQoutes";
import TitleBar from "@/shared/TitleBar";
import LoadingScreen from "./Loading";
import SermonLoadSkeleton from "@/components/SermonLoadSkeleton";
import SermonContentSkeleton from "@/components/SermonContentSkeleton";
import HomeSideSkeleton from "@/components/HomeSkeleton";
import CompactSkeleton from "@/components/CompactSkeleton";

// Lazy-loaded components (keeping heavy ones lazy)
const Gallery = React.lazy(() => import("./Media"));
const DeveloperPage = React.lazy(() => import("./Developer"));

// Import SermonList directly since it's frequently used
import SermonList from "./Allsermons";
import SelectedSermon from "./SelectedSermon";
import CombinedBookmarksRecents from "./CombinedBookmarksRecents";

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
              <SermonList />
            ) : activeTab === "message" ? (
              <SelectedSermon
                background={background}
                setBackground={setBackground}
              />
            ) : activeTab === "settings" ? (
              <FontSettingsPage />
            ) : activeTab === "library" ? (
              <CombinedBookmarksRecents />
            ) : activeTab === "about" ? (
              <Suspense
                fallback={
                  <div className="p-8">
                    <CompactSkeleton variant="card" lines={6} />
                  </div>
                }
              >
                <DeveloperPage />
              </Suspense>
            ) : activeTab === "media" ? (
              <Suspense
                fallback={
                  <div className="p-8">
                    <CompactSkeleton variant="list" lines={4} />
                  </div>
                }
              >
                <Gallery />
              </Suspense>
            ) : activeTab === "quotes" ? (
              <QuotesManager />
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
