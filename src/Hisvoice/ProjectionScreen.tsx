import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@/Provider/Theme";
import { formatSermonIntoParagraphs, searchSermon } from "@/utils/sermonUtils";
import { motion } from "framer-motion";

interface ProjectionData {
  type: string;
  [key: string]: any;
}

interface SermonParagraphData {
  id: number;
  content: string;
  originalIndex: number;
}

const Projection = () => {
  const { isDarkMode } = useTheme();
  const [currentParagraph, setCurrentParagraph] = useState<number>(0);
  const [sermonText, setSermonText] = useState<string>("");
  const [sermonTitle, setSermonTitle] = useState<string>("");
  const [sermonParagraphs, setSermonParagraphs] = useState<
    SermonParagraphData[]
  >([]);
  const [searchHighlight, setSearchHighlight] = useState<{
    paragraphId: number;
    searchTerm: string;
  } | null>(null);
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontFamily, setFontFamily] = useState<string>(
    "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, []);

  // Listen for projection commands from main window
  useEffect(() => {
    const handleProjectionCommand = (event: any, data: ProjectionData) => {
      switch (data.type) {
        case "update-sermon": {
          const text = data.sermon || "";
          setSermonText(text);
          setSermonTitle(data.title || "");

          // Format into paragraphs
          const formatted = formatSermonIntoParagraphs(text).map(
            (content, index) => ({
              id: index + 1,
              content,
              originalIndex: index,
            }),
          );
          setSermonParagraphs(formatted);
          setCurrentParagraph(0);
          break;
        }

        case "update-current-paragraph": {
          setCurrentParagraph(data.paragraphId || 0);
          // Smooth scroll to paragraph
          setTimeout(() => {
            const element = document.getElementById(`para-${data.paragraphId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
          break;
        }

        case "update-search-highlight": {
          setSearchHighlight({
            paragraphId: data.paragraphId,
            searchTerm: data.searchTerm,
          });
          break;
        }

        case "update-font-size": {
          setFontSize(data.size || 24);
          break;
        }

        case "update-font-family": {
          setFontFamily(data.fontFamily || fontFamily);
          break;
        }

        case "clear-highlight": {
          setSearchHighlight(null);
          break;
        }

        case "go-to-paragraph": {
          setCurrentParagraph(data.paragraphId || 0);
          setTimeout(() => {
            const element = document.getElementById(`para-${data.paragraphId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
          break;
        }

        default:
          console.log("Unknown projection command:", data.type);
      }
    };

    // Use window.ipcRenderer if available
    if (window.ipcRenderer) {
      window.ipcRenderer.on("projection-command", handleProjectionCommand);

      return () => {
        window.ipcRenderer.off("projection-command", handleProjectionCommand);
      };
    }
  }, [fontFamily]);

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;

    const searchTerm = term.trim();
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);

    if (index !== -1) {
      const before = text.slice(0, index);
      const match = text.slice(index, index + searchTerm.length);
      const after = text.slice(index + searchTerm.length);

      return (
        <>
          {before}
          <span className="bg-stone-300 dark:bg-stone-700 px-1 text-stone-900 dark:text-stone-200 rounded font-bold">
            {match}
          </span>
          {after}
        </>
      );
    }

    return text;
  };

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center p-12 overflow-hidden ${
        isDarkMode ? "bg-stone-900" : "bg-white"
      }`}
      ref={containerRef}
    >
      {/* Debug indicator - shows projection is loaded */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded text-xs ${
          isDarkMode
            ? "bg-green-900/50 text-green-300"
            : "bg-green-100 text-green-700"
        }`}
      >
        ✓ Projection Active
      </div>

      {/* Sermon Title */}
      {sermonTitle && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mb-8 ${
            isDarkMode ? "text-stone-100" : "text-stone-900"
          }`}
        >
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily }}>
            {sermonTitle}
          </h1>
          <div
            className={`text-lg ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}
          >
            Sermon Reading
          </div>
        </motion.div>
      )}

      {/* Sermon Content - Scrollable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 w-full overflow-y-auto no-scrollbar"
      >
        {sermonParagraphs.length > 0 ? (
          <div
            className={`max-w-4xl mx-auto space-y-6 leading-relaxed ${
              isDarkMode ? "text-stone-200" : "text-stone-900"
            }`}
          >
            {sermonParagraphs.map((paragraph) => {
              const isCurrent = paragraph.id === currentParagraph;
              const isHighlighted =
                searchHighlight?.paragraphId === paragraph.id;

              return (
                <motion.div
                  key={paragraph.id}
                  id={`para-${paragraph.id}`}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-6 rounded-lg transition-all duration-300 ${
                    isCurrent
                      ? isDarkMode
                        ? "bg-stone-800/50 border-l-4 border-stone-500"
                        : "bg-stone-100/50 border-l-4 border-stone-500"
                      : ""
                  } ${
                    isHighlighted
                      ? isDarkMode
                        ? "bg-stone-700/30"
                        : "bg-stone-200/30"
                      : ""
                  }`}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily,
                  }}
                >
                  {isHighlighted && searchHighlight?.searchTerm
                    ? highlightSearchTerm(
                        paragraph.content,
                        searchHighlight.searchTerm,
                      )
                    : paragraph.content}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div
            className={`text-center text-2xl ${
              isDarkMode ? "text-stone-500" : "text-stone-400"
            }`}
          >
            Waiting for sermon...
          </div>
        )}
      </motion.div>

      {/* Bottom Info Bar */}
      {sermonParagraphs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 text-center text-sm ${
            isDarkMode ? "text-stone-400" : "text-stone-600"
          }`}
        >
          Paragraph {currentParagraph} of {sermonParagraphs.length}
        </motion.div>
      )}
    </div>
  );
};

export default Projection;
