import { memo } from "react";

interface FastLoaderProps {
  message?: string;
  progress?: number;
}

const FastLoader = memo(
  ({ message = "Loading...", progress }: FastLoaderProps) => {
    return (
      <div className="flex items-center justify-center h-32 w-full">
        <div className="text-center">
          {/* Simple CSS-only spinner for minimal overhead */}
          <div className="inline-block w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-stone-600 dark:text-gray-300 text-sm mt-2">
            {message}
          </p>
          {progress !== undefined && (
            <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mx-auto">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

FastLoader.displayName = "FastLoader";

export default FastLoader;
