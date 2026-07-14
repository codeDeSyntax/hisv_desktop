import * as React from "react";
import { useTheme } from "@/Provider/Theme";

interface SermonHeaderProps {
  title: string;
  date?: string;
  location?: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: React.CSSProperties["fontWeight"];
}

const SermonHeader = ({
  title,
  date,
  location,
  fontSize,
  fontFamily,
  fontWeight = 400,
}: SermonHeaderProps) => {
  const { isDarkMode, accentColor } = useTheme();
  const titleFontSize = Math.max(fontSize * 1.25, fontSize + 4);
  const metaFontSize = Math.max(titleFontSize * 0.5, 12);
  const metadata = [date, location].filter(Boolean).join(" · ");

  return (
    <div className="w-full pt-6 pb-8 self-stretch flex flex-col justify-center items-center gap-3">
      <h1
        className="w-full p-3    break-words text-center font-serif font-normal leading-[1.1] tracking-[-0.02em]"
        style={{
          color: isDarkMode ? "#cbcbcb" : "#111827",
          fontSize: `${titleFontSize}px`,
          fontWeight,
          transform: "scaleY(1.12) scaleX(0.92)",
          transformOrigin: "center top",
          display: "block",
        }}
      >
        {title}
      </h1>
      {metadata && (
        <p
          className="px-2  text-center bg-neutral-400 font-serif font-medium leading-[1.4] tracking-normal mt-3"
          style={{
            // color: isDarkMode
            //   ? "rgba(203,203,203,0.75)"
            //   : "rgba(31,41,55,0.75)",
            fontSize: `${metaFontSize * 0.8}px`,
          transform: "scaleY(1.12) scaleX(0.92)",
            lineHeight: 1.4,
            // backgroundColor:"white"
          }}
        >
          {metadata}
        </p>
      )}
      {/* line separator */}
      <div className="w-full h-px bg-neutral-400/20"></div>
    </div>
  );
};

export default SermonHeader;
