import { useSermonContext } from "@/Provider/Vsermons";
import FastLoader from "@/components/FastLoader";

const LoadingScreen = () => {
  const { loadingProgress, loadingMessage } = useSermonContext();

  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <img
            src="./icon.png"
            alt="His Voice"
            className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg"
          />
          <h1 className="text-2xl font-bold text-stone-700 dark:text-orange-100 mb-2">
            His Voice
          </h1>
          <p className="text-stone-500 dark:text-gray-400 text-sm">
            Sermon Archive & Reader
          </p>
        </div>

        <FastLoader
          message={loadingMessage || "Loading sermons..."}
          progress={loadingProgress}
        />

        <div className="mt-6 text-xs text-stone-400 dark:text-gray-500">
          {loadingProgress < 40 && "Preparing your sermon library..."}
          {loadingProgress >= 40 &&
            loadingProgress < 100 &&
            "Loading additional content in background"}
          {loadingProgress === 100 && "Ready to explore!"}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
