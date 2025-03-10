import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState } from "react";

export const VersePaste = ({ editor }: { editor: Editor | null }) => {
  const [verseNumber, setVerseNumber] = useState(1); // Track the current verse number

  const handleInsertText = () => {
    if (!editor || !editor.isEditable) return;

    // Create the predefined text with the current verse number
    const predefinedText = `<!-- Verse ${verseNumber} -->`;

    // Insert the predefined text at the cursor
    editor
      .chain()
      .focus()
      .insertContent(predefinedText)
      .run();

    // Increment the verse number, and reset to 1 if it reaches 6
    setVerseNumber((prev) => (prev === 5 ? 1 : prev + 1));
  };

  return (
    <button
      onClick={handleInsertText}
      className="bg-[#9a674a] hover:bg-[#8a5739] text-white font-thin text-[12px] py-2 px-3 rounded-lg shadow-lg transition-all duration-300"
    >
      V
    </button>
  );
};
