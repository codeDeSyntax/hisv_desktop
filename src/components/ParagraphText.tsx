import React, { useState, useCallback, useMemo } from "react";

interface ParagraphTextProps {
  paragraph: string;
  index: number;
  searchPhrase?: string;
  selectedSermon?: any;
  onLayout?: (event: any) => void;
  theme?: any;
  settings?: any;
}

const ParagraphText: React.FC<ParagraphTextProps> = ({
  paragraph,
  index,
  searchPhrase = "",
  selectedSermon,
  onLayout,
  theme,
  settings,
}) => {
  const [isCopying, setIsCopying] = useState(false);

  // Process text for search highlighting and endnotes (matches mobile logic)
  const processedText = useMemo(() => {
    const hasEndnote = paragraph.includes("Endnote");
    const hasReference = paragraph.includes("Reference");
    const hasSearch = searchPhrase && searchPhrase.length > 0;

    if (hasEndnote || hasReference) {
      return {
        type: "endnote",
        parts: paragraph.split(/(Endnote|Reference)/gi),
      };
    } else if (hasSearch) {
      return {
        type: "search",
        parts: paragraph.split(new RegExp(`(${searchPhrase})`, "gi")),
      };
    } else {
      return {
        type: "normal",
        text: paragraph,
      };
    }
  }, [paragraph, searchPhrase]);

  // Copy to clipboard functionality (matches mobile logic)
  const copyToClipboard = useCallback(async () => {
    if (isCopying) return;

    try {
      setIsCopying(true);
      const sermonInfo = selectedSermon
        ? `\n\nFrom: "${selectedSermon.title}" - ${
            selectedSermon.date || "No date available"
          }`
        : "";

      const textToCopy = `https://hisvoice.vercel.app/ \n${paragraph}${sermonInfo}`;
      await navigator.clipboard.writeText(textToCopy);

      // Show notification (you can implement toast here)
      console.log("Paragraph copied to clipboard");
    } catch (error) {
      console.error("Copy failed:", error);
    } finally {
      setIsCopying(false);
    }
  }, [isCopying, paragraph, selectedSermon]);

  // Render highlighted text for search (matches mobile logic)
  const renderHighlightedText = () => {
    if (processedText.type === "search" && processedText.parts) {
      return processedText.parts.map((part, partIndex) =>
        part.toLowerCase() === searchPhrase.toLowerCase() ? (
          <span
            key={`highlight-${partIndex}`}
            className="bg-yellow-200 dark:bg-yellow-600 px-2 rounded"
          >
            {part}
          </span>
        ) : (
          <span key={`text-${partIndex}`}>{part}</span>
        )
      );
    }
    return processedText.text;
  };

  // Render endnote text (matches mobile logic)
  const renderEndnoteText = () => {
    if (processedText.type === "endnote" && processedText.parts) {
      return processedText.parts.map((part, partIndex) => {
        const lowerPart = part.toLowerCase();
        if (lowerPart === "endnote" || lowerPart === "reference") {
          return (
            <span
              key={`endnote-${partIndex}`}
              className="text-amber-700 dark:text-amber-400 font-semibold"
              title="William branham quote.🗝️🗝️ WMB quote ends when you dont find the paragraph numbers anymore"
            >
              {part}
            </span>
          );
        }
        return <span key={`text-${partIndex}`}>{part}</span>;
      });
    }
    return processedText.text;
  };

  return (
    <div
      className={`paragraph-container mb-4 p-3 rounded-lg border-l-2 border-transparent hover:border-amber-500 dark:hover:border-amber-400 transition-all ${
        isCopying ? "bg-gray-100 dark:bg-gray-800" : ""
      }`}
      onDoubleClick={copyToClipboard}
    >
      <div className="flex items-start gap-3">
        {/* Paragraph number (matches mobile: index + 1) */}
        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            {index + 1}
          </span>
        </div>

        {/* Paragraph text */}
        <div className="flex-1">
          <p
            className="text-gray-900 dark:text-gray-100 leading-relaxed"
            style={{
              fontSize: settings?.fontSize || 16,
              fontFamily: settings?.fontFamily || "inherit",
              //   lineHeight: "1.4",
            }}
          >
            {processedText.type === "endnote"
              ? renderEndnoteText()
              : processedText.type === "search"
              ? renderHighlightedText()
              : processedText.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParagraphText;
