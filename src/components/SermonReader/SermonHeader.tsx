import React from "react";
import TypingVerse from "@/components/TypingText";
import { useTheme } from "@/Provider/Theme";

interface SermonHeaderProps {
  title: string;
}

const SermonHeader = ({ title }: SermonHeaderProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="mb-4 text-center text-background">
      <TypingVerse
        verse={title}
        typingSpeed={40}
        minHeight={0}
        fontFamily="Zilla Slab"
        fontSize={30}
        color={isDarkMode ? "#cbcbcb " : "black "}
        align="center"
      />
    </div>
  );
};

export default SermonHeader;
