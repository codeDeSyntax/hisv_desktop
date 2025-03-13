import React from 'react';
import { X, Star } from 'lucide-react';
import { useBibleContext } from '@/Provider/Bible';

export const BookmarkPanel: React.FC = () => {
  const { 
    setActiveFeature, 
    bookmarks, 
    removeBookmark,
    setCurrentBook,
    setCurrentChapter 
  }: {
    setActiveFeature: (feature: string | null) => void,
    bookmarks: string[],
    removeBookmark: (bookmark: string) => void,
    setCurrentBook: (book: string) => void,
    setCurrentChapter: (chapter: number) => void
  } = useBibleContext();

  const handleBookmarkClick = (bookmark: string) => {
    // Parse the bookmark format "Book Chapter:Verse"
    const parts = bookmark.split(' ');
    const chapterVerse = parts[parts.length - 1];
    const chapterNumber = parseInt(chapterVerse.split(':')[0]);
    
    // Book name is everything except the last part
    const bookName = parts.slice(0, parts.length - 1).join(' ');
    
    setCurrentBook(bookName);
    setCurrentChapter(chapterNumber);
    setActiveFeature(null);
  };

  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bookmarks</h2>
        <button onClick={() => setActiveFeature(null)} className="p-1">
          <X size={20} />
        </button>
        </div>
        <div className="flex flex-col gap-4">
          {bookmarks.map((bookmark, index) => (
            <button
              key={index}
              onClick={() => handleBookmarkClick(bookmark)}
              className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              <span>{bookmark}</span>
              <span onClick={() => removeBookmark(bookmark)} className="p-1">
                <Star size={16} />
              </span>
            </button>
          ))}
        </div>
        </div>
    );
}

