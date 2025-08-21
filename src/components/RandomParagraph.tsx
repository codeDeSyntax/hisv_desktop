import React, { useEffect, useMemo, useRef } from "react";
import TypingVerse from "./TypingText";
import AutoScrollBox from "./AutoScroll";
import { useTheme } from "@/Provider/Theme";
import { formatSermonIntoParagraphs } from "@/utils/sermonUtils";

interface SermonParagraph {
  id: number;
  content: string;
  originalIndex: number;
}

interface Sermon {
  sermon: string;
  // Add other sermon properties as needed
  id?: string;
  title?: string;
  year?: string;
  location?: string;
  type?: string;
}

interface RandomSermonParagraphProps {
  sermon: Sermon;
}

const RandomSermonParagraph: React.FC<RandomSermonParagraphProps> = ({
  sermon,
}) => {
  // const containerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //     const div = containerRef.current;
  //     if (div) {
  //       div.scrollTop = div.scrollHeight;
  //     }
  //   }, []);
  const { isDarkMode } = useTheme();

  const sermonParagraphs = useMemo((): SermonParagraph[] => {
    if (!sermon?.sermon) return [];

    // Use the same formatting logic as mobile app
    const formattedParagraphs = formatSermonIntoParagraphs(sermon.sermon);

    // Convert to SermonParagraph format for compatibility
    return formattedParagraphs.map((content, index) => ({
      id: index + 1,
      content: content,
      originalIndex: index,
    }));
  }, [sermon?.sermon]);

  const randomParagraph = useMemo((): SermonParagraph | null => {
    if (sermonParagraphs.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * sermonParagraphs.length);
    return sermonParagraphs[randomIndex];
  }, [sermonParagraphs]);

  if (!sermon?.sermon || sermon.sermon.trim() === "") {
    return (
      <div className="h-20 px-6 py-4">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!randomParagraph) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 italic">
        No paragraphs found in sermon
      </div>
    );
  }

  return (
    <div className="px-6  rounded-lg shadow-sm border  border-gray-200 dark:border-gray-700 rounded-b-3xl">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
        Random Excerpt
      </div>
      <div className="leading-relaxed h-28 font-zilla overflow-y-auto no-scrollbar text-gray-100">
        <TypingVerse
          verse={randomParagraph.content}
          typingSpeed={40}
          // fontFamily="Zilla"
          fontSize={13}
          align="left"
          minHeight={20}
          color={isDarkMode ? "white" : "#553b1d"}
        />
      </div>
      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Paragraph {randomParagraph.id} of {sermonParagraphs.length}
      </div>
    </div>
  );
};

export default RandomSermonParagraph;
