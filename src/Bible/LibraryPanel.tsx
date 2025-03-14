import React, { useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

const LibraryPanel: React.FC = () => {
  const {
    setActiveFeature,
    bookList,
    currentTranslation,
    setCurrentTranslation,
    currentBook,
    setCurrentBook,
    currentChapter,
    setCurrentChapter,
    getBookChapterCount,
    theme
  } = useBibleContext();

  // State for tracking which books are expanded
  const [expandedBooks, setExpandedBooks] = useState<{
    [key: string]: boolean;
  }>({
    [currentBook]: true,
  });

  // Toggle expanded state for a book
  const toggleExpandBook = (book: string) => {
    setExpandedBooks({
      ...expandedBooks,
      [book]: !expandedBooks[book],
    });
  };

  // Group books by testament
  const oldTestament = bookList.slice(0, 39); // First 39 books are Old Testament
  const newTestament = bookList.slice(39); // Rest are New Testament

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-black font-serif">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bible Library
          </h2>
          <button
            onClick={() => setActiveFeature(null)}
            className="p-1 hover:bg-gray-100 bg-gray-50 shadow  dark:bg-bgray  dark:hover:bg-bgray rounded"
          >
            <X size={20} className="text-gray-900 dark:text-white" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
            Translation
          </label>
          <select
            value={currentTranslation}
            onChange={(e) => setCurrentTranslation(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-bgray focus:outline-none text-gray-900 dark:text-white"
          >
            <option value="KJV" className="py-2">
              King James Version
            </option>
            <option value="TWI" className="py-2">
              Twi
            </option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" 
      style={{
        scrollbarWidth: "thin",
        scrollbarColor:
          theme === "light" ? "#f9fafb #f3f4f6" : "#424242 #202020",
        // scrollbarGutter: "stable",
      }}
      >
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Old Testament
          </h3>
          <div className="pl-2 space-y-1">
            {oldTestament.map((book) => (
              <div key={book.name}>
                <button
                  className={`flex items-center text-[12px] w-full text-left py-1 px-2 rounded-md focus:outline-none ${
                    currentBook === book.name
                      ? "bg-gray-200 dark:bg-bgray text-stone-500 dark:text-gray-50"
                      : "bg-gray-100 dark:bg-bgray text-stone-500 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-bgray/20 transition-colors"
                  }`}
                  onClick={() => toggleExpandBook(book.name)}
                >
                  {expandedBooks[book.name] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <span className="ml-1">{book.name}</span>
                </button>

                {expandedBooks[book.name] && (
                  <div className="pl-6 mt-1 grid grid-cols-4 gap-1">
                    {Array.from(
                      { length: getBookChapterCount(book.name) || 1 },
                      (_, i) => i + 1
                    ).map((chapter) => (
                      <button
                        key={`${book.name}-${chapter}`}
                        className={`text-[12px] py-1 px-2 rounded-md focus:outline-none focus:borderno ${
                          currentBook === book.name &&
                          currentChapter === chapter
                            ? "bg-gray-200 dark:bg-bgray text-stone-500 dark:text-gray-50"
                            : "bg-gray-100 dark:bg-bgray text-stone-500 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        }`}
                        onClick={() => {
                          setCurrentBook(book.name);
                          setCurrentChapter(chapter);
                          setActiveFeature(null);
                        }}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            New Testament
          </h3>
          <div className="pl-2 space-y-1">
            {newTestament.map((book) => (
              <div key={book.name}>
                <button
                  className={`flex items-center text-[12px] w-full text-left py-1 px-2 rounded-md ${
                    currentBook === book.name
                      ? "bg-gray-200 dark:bg-bgray text-stone-500 dark:text-gray-50"
                      : "bg-gray-100 dark:bg-bgray text-stone-500 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-bgray/30 transition-colors"
                  }`}
                  onClick={() => toggleExpandBook(book.name)}
                >
                  {expandedBooks[book.name] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <span className="ml-1">{book.name}</span>
                </button>

                {expandedBooks[book.name] && (
                  <div className="pl-6 mt-1 grid grid-cols-4 gap-1">
                    {Array.from(
                      { length: getBookChapterCount(book.name) || 1 },
                      (_, i) => i + 1
                    ).map((chapter) => (
                      <button
                        key={`${book.name}-${chapter}`}
                        className={`text-[12px] py-1 px-2 rounded-md focus:outline-none ${
                          currentBook === book.name &&
                          currentChapter === chapter
                            ? "bg-gray-200 dark:bg-bgray text-stone-500 dark:text-gray-50"
                            : "bg-gray-100 dark:bg-bgray text-stone-500 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        }`}
                        onClick={() => {
                          setCurrentBook(book.name);
                          setCurrentChapter(chapter);
                          setActiveFeature(null);
                        }}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPanel;
