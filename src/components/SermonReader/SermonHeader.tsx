import React from "react";
import { useTheme } from "@/Provider/Theme";

interface SermonHeaderProps {
  title: string;
}

const SermonHeader = ({ title }: SermonHeaderProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="pt-3 text-center text-background">
      <h1
        className="text-3xl font-bold"
        style={{
          color: isDarkMode ? "#cbcbcb" : "black",
          fontFamily: "Zilla Slab",
        }}
      >
        {title}
      </h1>
    </div>
  );
};

export default SermonHeader;
