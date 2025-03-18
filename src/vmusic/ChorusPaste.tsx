import { useEditor, EditorContent, Editor } from "@tiptap/react";

const predefinedText = "<!-- Chorus -->"; // The text that will be inserted

// Custom Extension to insert predefined text at the cursor
export const ChorusPaste = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const handleInsertText = () => {
    if (!editor.isEditable) return;

    editor
      .chain()
      .focus()
      .insertContent(predefinedText) // Insert the predefined text at the cursor
      .run();
  };

  return (
    <button
      onClick={handleInsertText}
      className="bg-[#9a674a] hover:bg-[#8a5739] text-white font-thin p-2 text-[12x] px-2 rounded-lg shadow-lg transition-all duration-300"
    >
      Ch
    </button>
  );
};
