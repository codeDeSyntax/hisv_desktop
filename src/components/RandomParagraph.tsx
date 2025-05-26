import React, { useEffect, useMemo, useRef } from "react";
import TypingVerse from "./TypingText";
import AutoScrollBox from "./AutoScroll";
import { useTheme } from "@/Provider/Theme";

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

    const rawParagraphs = sermon.sermon.split("\n\n").filter((p) => p.trim());
    const processedParagraphs: SermonParagraph[] = [];
    let paragraphId = 1;

    rawParagraphs.forEach((paragraph, originalIndex) => {
      const words = paragraph.trim().split(/\s+/);
      const sentences = paragraph.split(/[.!?]+/).filter((s) => s.trim());

      // Determine optimal paragraph length based on content
      let targetLength: number;
      if (sentences.length <= 2 && words.length < 50) {
        targetLength = words.length; // Keep short paragraphs as is
      } else if (words.length <= 150) {
        targetLength = words.length; // Medium paragraphs stay whole
      } else {
        targetLength = Math.max(
          100,
          Math.min(
            200,
            Math.floor(words.length / Math.ceil(words.length / 150))
          )
        );
      }

      if (words.length <= targetLength) {
        processedParagraphs.push({
          id: paragraphId++,
          content: paragraph.trim(),
          originalIndex,
        });
      } else {
        // Split long paragraphs intelligently
        let currentChunk = "";
        let wordCount = 0;

        words.forEach((word) => {
          if (
            wordCount > 0 &&
            (wordCount >= targetLength ||
              (wordCount >= targetLength * 0.8 && /[.!?]$/.test(word)))
          ) {
            processedParagraphs.push({
              id: paragraphId++,
              content: currentChunk.trim(),
              originalIndex,
            });
            currentChunk = word;
            wordCount = 1;
          } else {
            currentChunk += (wordCount > 0 ? " " : "") + word;
            wordCount++;
          }
        });

        if (currentChunk.trim()) {
          processedParagraphs.push({
            id: paragraphId++,
            content: currentChunk.trim(),
            originalIndex,
          });
        }
      }
    });

    return processedParagraphs;
  }, [sermon?.sermon]);

  const randomParagraph = useMemo((): SermonParagraph | null => {
    if (sermonParagraphs.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * sermonParagraphs.length);
    return sermonParagraphs[randomIndex];
  }, [sermonParagraphs]);

  if (!sermon?.sermon) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 italic">
        No sermon content available
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
    <div className="px-6  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 rounded-b-3xl">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
        Random Excerpt
      </div>
      <p className=" leading-relaxed h-28 overflow-y-auto no-scrollbar text-gray-100">
        <TypingVerse
          verse={randomParagraph.content}
          typingSpeed={40}
          fontFamily="Garamond"
          fontSize={13}
          align="left"
          minHeight={20}
          color={isDarkMode ? "white" : "black"}
        />
      </p>
      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Paragraph {randomParagraph.id} of {sermonParagraphs.length}
      </div>
    </div>
  );
};

export default RandomSermonParagraph;
