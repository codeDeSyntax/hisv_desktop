import React from "react";
import { X, Star } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

export const BookmarkPanel: React.FC = () => {
  const {
    setActiveFeature,
    bookmarks,
    removeBookmark,
    setCurrentBook,
    setCurrentChapter,
    setCurrentVerse,
  } = useBibleContext();

  const handleBookmarkClick = (bookmark: string) => {
    // Parse the bookmark format "Book Chapter:Verse"
    const parts = bookmark.split(" ");
    const chapterVerse = parts[parts.length - 1];

    // Check if the bookmark has a verse reference
    if (chapterVerse.includes(":")) {
      const [chapterStr, verseStr] = chapterVerse.split(":");
      const chapterNumber = parseInt(chapterStr);
      const verseNumber = parseInt(verseStr);

      // Book name is everything except the last part
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      setCurrentBook(bookName);
      setCurrentChapter(chapterNumber);
      setCurrentVerse(verseNumber);
    } else {
      // If no verse is specified, just navigate to the chapter
      const chapterNumber = parseInt(chapterVerse);

      // Book name is everything except the last part
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      setCurrentBook(bookName);
      setCurrentChapter(chapterNumber);
      setCurrentVerse(null); // Reset verse when navigating to just a chapter
    }

    setActiveFeature(null);
  };

  // Handle the case when a user clicks on the star icon
  const handleRemoveBookmark = (event: React.MouseEvent, bookmark: string) => {
    event.stopPropagation(); // Prevent triggering the parent button click
    removeBookmark(bookmark);
  };

  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-black font-serif overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bookmarks
        </h2>
        <button
          onClick={() => setActiveFeature(null)}
          className="p-1 hover:bg-gray-100 bg-gray-50 dark:bg-bgray shadow dark:hover:bg-bgray rounded"
        >
          <X size={20} className="text-gray-900 dark:text-white" />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark, index) => (
            <button
              key={index}
              onClick={() => handleBookmarkClick(bookmark)}
              className="flex items-center justify-between p-2 bg-gray-100 dark:bg-bgray hover:bg-gray-200 dark:hover:bg-bgray/50 rounded-md"
            >
              <span className="text-gray-900 text-[14px] dark:text-white">
                {bookmark}
              </span>
              <span
                onClick={(e) => handleRemoveBookmark(e, bookmark)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <Star size={16} className="text-gray-900 dark:text-white" />
              </span>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No bookmarks yet
          </div>
        )}
      </div>
    </div>
  );
};
