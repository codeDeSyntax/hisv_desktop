import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

const HistoryPanel: React.FC = () => {
  const {
    setActiveFeature,
    history,
    setCurrentBook,
    setCurrentChapter,
    currentVerse,
    setCurrentVerse,
  } = useBibleContext();
 

  const handleHistoryClick = (reference: string) => {
    // Check if reference includes a verse (format: "Book Chapter:Verse")
    if (reference.includes(":")) {
      const [chapterPart, versePart] = reference.split(":");
      const verse = parseInt(versePart);
  
      

      // Handle chapter part which contains book and chapter
      const parts = chapterPart.split(" ");
      const chapterNumber = parseInt(parts[parts.length - 1]);
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      setCurrentBook(bookName);
      setCurrentChapter(chapterNumber);
      setCurrentVerse(null);
      setCurrentVerse(verse);
    } else {
      // Original handling for just book and chapter
      const parts = reference.split(" ");
      const chapterNumber = parseInt(parts[parts.length - 1]);
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      setCurrentBook(bookName);
      setCurrentChapter(chapterNumber);
      setCurrentVerse(1); // Reset verse when navigating to just a chapter
    }

    setActiveFeature(null);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="h-full overflow-y-scroll no-scrollbar p-4 bg-gray-50 dark:bg-black font-serif">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          History
        </h2>
        <button
          onClick={() => setActiveFeature(null)}
          className="p-1 hover:bg-gray-100 bg-gray-50 shadow dark:bg-bgray dark:hover:bg-bgray rounded"
        >
          <X size={20} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {history.length > 0 ? (
          history.map((item, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(item.reference)}
              className="flex flex-col items-start p-3 bg-gray-100 dark:bg-bgray hover:bg-gray-200 dark:hover:bg-bgray/40 rounded-md text-left transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white text-[14px]">
                {item.reference}
              </span>
              <span className="text-[12px] text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <Clock size={12} className="mr-1" />{" "}
                {formatTimestamp(item.timestamp)}
              </span>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No history yet
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
