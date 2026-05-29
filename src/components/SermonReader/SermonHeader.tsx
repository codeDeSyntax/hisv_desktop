import * as React from "react";
import { useTheme } from "@/Provider/Theme";

interface SermonHeaderProps {
  title: string;
  date?: string;
  location?: string;
  fontSize: number;
  fontFamily?: string;
}

const SermonHeader = ({
  title,
  date,
  location,
  fontSize,
  fontFamily,
}: SermonHeaderProps) => {
  const { isDarkMode, accentColor } = useTheme();
  const titleFontSize = Math.max(fontSize * 1.25, fontSize + 4);
  const metaFontSize = Math.max(titleFontSize * 0.5, 12);
  const metadata = [date, location].filter(Boolean).join(" · ");

  return (
    <div className="w-full pt-3 pb-6 px-6 text-left text-background">
      <h1
        className="italic w-full break-words text-center tracking-wide"
        style={{
          color: isDarkMode ? "#cbcbcb" : "black",
          fontSize: `${titleFontSize}px`,
          fontFamily: fontFamily || "Outfit",
          lineHeight: 1.05,
        }}
      >
        {title}
      </h1>
      {metadata && (
        <p
          className="mt-2 font-medium text-center tracking-normal"
          style={{
            color: accentColor,
            fontSize: `${metaFontSize}px`,
            fontFamily: fontFamily || "Outfit",
            lineHeight: 1.2,
          }}
        >
          {metadata}
        </p>
      )}
    </div>
  );
};

export default SermonHeader;
