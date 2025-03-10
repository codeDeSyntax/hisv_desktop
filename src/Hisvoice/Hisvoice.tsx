import React, { useState, Suspense } from "react";
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

// Lazy-loaded components
const Gallery = React.lazy(() => import("./Media"));
const SermonList = React.lazy(() => import("./Allsermons"));
const SelectedSermon = React.lazy(() => import("./SelectedSermon"));
const DeveloperPage = React.lazy(() => import("./Developer"));

const Hisvoice = () => {
  // const [isCollapsed, setIsCollapsed] = useState(true);
  const { activeTab, isCollapsed, setIsCollapsed } = useSermonContext();
  const [background, setBackground] = useState(false);

  return (
    <div className="max-h-screen overflow-y-scroll no-scrollbar">
      <TitleBar />
      <div
        className={`h-full bg-primary  ${
          isCollapsed ? "ml-16" : "ml-64"
        } scrollbar-hidden`}
      >
        <div className="flex h-screen bg-primary ">
          <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          {/* Main content */}
          <div className="flex-1">
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
            ) : (
              <p className="text-center text-gray-500">Page not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hisvoice;
