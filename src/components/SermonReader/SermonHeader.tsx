import * as React from "react";
import { useTheme } from "@/Provider/Theme";

interface SermonHeaderProps {
  title: string;
}

const SermonHeader = ({ title }: SermonHeaderProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="w-full pt-3 px-4 sm:px-6 text-left text-background">
      <h1
        className="text-2xl font-bold w-full break-words text-center  scale-x-[1.4] tracking-wide"
        style={{
          color: isDarkMode ? "#cbcbcb" : "black",
          // fontFamily: "Zilla Slab",
        }}
      >
        {title}
      </h1>
    </div>
  );
};

export default SermonHeader;
