import { memo } from "react";

interface CompactSkeletonProps {
  lines?: number;
  width?: "full" | "large" | "medium" | "small";
  height?: "small" | "medium" | "large";
  variant?: "text" | "card" | "list" | "button";
  animated?: boolean;
}

const CompactSkeleton = memo(
  ({
    lines = 3,
    width = "full",
    height = "medium",
    variant = "text",
    animated = true,
  }: CompactSkeletonProps) => {
    const getWidthClass = (w: string, index?: number) => {
      const widthMap = {
        full: "w-full",
        large: "w-5/6",
        medium: "w-3/4",
        small: "w-1/2",
      };

      // Add some variation for text lines
      if (variant === "text" && index !== undefined) {
        const variations = ["w-full", "w-11/12", "w-5/6", "w-4/5", "w-3/4"];
        return variations[index % variations.length];
      }

      return widthMap[w as keyof typeof widthMap] || widthMap.full;
    };

    const getHeightClass = () => {
      const heightMap = {
        small: "h-3",
        medium: "h-4",
        large: "h-6",
      };
      return heightMap[height];
    };

    const baseClasses = `
    bg-stone-200 dark:bg-stone-700 rounded
    ${animated ? "animate-pulse" : ""}
    ${getHeightClass()}
  `;

    if (variant === "button") {
      return (
        <div className={`${baseClasses} ${getWidthClass(width)} rounded-md`} />
      );
    }

    if (variant === "card") {
      return (
        <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4">
          <div className="space-y-3">
            <div className={`${baseClasses} w-3/4`} />
            <div className={`${baseClasses} w-full`} />
            <div className={`${baseClasses} w-5/6`} />
          </div>
        </div>
      );
    }

    if (variant === "list") {
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className={`${baseClasses} w-3/4`} />
                <div className={`${baseClasses} w-1/2 h-3`} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default text variant
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getWidthClass(width, index)}`}
            style={{
              animationDelay: animated ? `${index * 100}ms` : "0ms",
            }}
          />
        ))}
      </div>
    );
  }
);

CompactSkeleton.displayName = "CompactSkeleton";

export default CompactSkeleton;
