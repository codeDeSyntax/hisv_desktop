// import React, {
//   useContext,
//   useRef,
//   useEffect,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import PropTypes from "prop-types";
// import { Card, Button, theme } from "antd";
// import DownloadSermon from "./PlayDownload";
// import {
//   ImageIcon,
//   Search,
//   X,
//   Info,
//   Menu,
//   ChevronUp,
//   ChevronDown,
//   BookOpen,
//   BookmarkCheck,
//   Bookmark,
//   TextIcon,
//   TextSelectIcon,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { AnimatePresence } from "framer-motion";
// import { Sermon } from "@/types";
// import { useSermonContext } from "@/Provider/Vsermons";
// import TypingVerse from "@/components/TypingText";
// import { useTheme } from "@/Provider/Theme";
// import {
//   formatSermonIntoParagraphs,
//   formatSermonIntoParagraphsAsync,
//   searchSermon,
// } from "@/utils/sermonUtils";

// // Enhanced paragraph interface
// interface SermonParagraph {
//   id: number;
//   content: string;
//   originalIndex: number;
// }

// // Receipt-style control panel component
// const ReceiptStylePanel = ({
//   show,
//   onClose,
//   sermon,
//   onSearch,
//   searchResults,
//   currentMatch,
//   onNavigateSearch,
//   currentParagraph,
//   onJumpToParagraph,
// }: // theme,
// {
//   show: boolean;
//   onClose: () => void;
//   sermon: Sermon | null;
//   onSearch: (query: string) => void;
//   searchResults: { paragraphId: number; matches: number }[];
//   currentMatch: number;
//   onNavigateSearch: (direction: "next" | "prev") => void;
//   currentParagraph: number;
//   onJumpToParagraph: (paragraphId: number) => void;
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [jumpToParagraph, setJumpToParagraph] = useState("");
//   const { isDarkMode } = useTheme();

//   const handleSearch = () => {
//     if (searchQuery.trim()) {
//       onSearch(searchQuery);
//     }
//   };

//   const handleJump = () => {
//     const paragraphNum = parseInt(jumpToParagraph);
//     if (paragraphNum && paragraphNum > 0) {
//       onJumpToParagraph(paragraphNum);
//       setJumpToParagraph("");
//     }
//   };

//   return (
//     <AnimatePresence>
//       {show && (
//         <>
//           {/* Simple backdrop overlay */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-40"
//             onClick={onClose}
//           />

//           {/* Compact Receipt Modal */}
//           <motion.div
//             initial={{ opacity: 0, x: 300, scale: 0.95 }}
//             animate={{ opacity: 1, x: 0, scale: 1 }}
//             exit={{ opacity: 0, x: 300, scale: 0.95 }}
//             transition={{ type: "spring", damping: 25, stiffness: 300 }}
//             className={`absolute right-4 top-10 w-80 max-h-[85vh] overflow-y-auto no-scrollbar z-50 rounded-lg shadow-lg border ${
//               isDarkMode
//                 ? "bg-stone-800 border-stone-600"
//                 : "bg-white border-stone-300"
//             }`}
//             style={{
//               fontFamily: "Garamond, Georgia, serif",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Compact Header */}
//             <div
//               className={`p-3 border-b ${
//                 isDarkMode ? "border-stone-600" : "border-stone-300"
//               }`}
//             >
//               <div className="flex justify-between items-center">
//                 <h3
//                   className={`text-lg font-semibold ${
//                     isDarkMode ? "text-stone-100" : "text-stone-800"
//                   }`}
//                 >
//                   Reading Tools
//                 </h3>
//                 <button
//                   onClick={onClose}
//                   className={`p-1 rounded transition-colors ${
//                     isDarkMode
//                       ? "text-stone-400 hover:text-stone-200 hover:bg-stone-700"
//                       : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
//                   }`}
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//             </div>

//             {/* Sermon Information */}
//             {sermon && (
//               <div
//                 className={`p-3 border-b text-sm ${
//                   isDarkMode ? "border-stone-600" : "border-stone-300"
//                 }`}
//               >
//                 <div
//                   className={`space-y-1 ${
//                     isDarkMode ? "text-stone-300" : "text-stone-600"
//                   }`}
//                 >
//                   <div className="flex justify-between">
//                     <span>Title:</span>
//                     <span className="text-right max-w-40 truncate font-bold text-">
//                       {sermon.title}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Location:</span>
//                     <span className="font-medium">{sermon.location}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Year:</span>
//                     <span className="font-medium">{sermon.year || "N/A"}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Type:</span>
//                     <span className="font-medium uppercase text-xs">
//                       {sermon.type}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Current Reading Position */}
//             <div
//               className={`p-3 border-b ${
//                 isDarkMode ? "border-stone-600" : "border-stone-300"
//               }`}
//             >
//               <div
//                 className={`text-center py-2 px-3 rounded ${
//                   isDarkMode
//                     ? "bg-stone-700 text-stone-200"
//                     : "bg-stone-100 text-stone-700"
//                 }`}
//               >
//                 {/* <div className="text-xs">Current Position</div> */}
//                 <div className="text-lg font-semibold">
//                   Paragraph #{currentParagraph}
//                 </div>
//               </div>
//             </div>

//             {/* Quick Navigation */}
//             <div
//               className={`p-3 border-b ${
//                 isDarkMode ? "border-stone-600" : "border-stone-300"
//               }`}
//             >
//               <div className="mb-2">
//                 <h4
//                   className={`text-sm font-medium ${
//                     isDarkMode ? "text-stone-200" : "text-stone-700"
//                   }`}
//                 >
//                   Jump to Paragraph
//                 </h4>
//               </div>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   value={jumpToParagraph}
//                   onChange={(e) => setJumpToParagraph(e.target.value)}
//                   placeholder="Enter #"
//                   spellCheck={false}
//                   className={`flex-1 px-2 pl-3 py-2 outline-none focus:ring-1 focus:ring-[#99674a] text-sm rounded-full border-none ${
//                     isDarkMode
//                       ? "bg-stone-700 border-stone-600 text-stone-200 placeholder-stone-400"
//                       : "bg-stone-50 border-stone-300 text-stone-700 placeholder-stone-500"
//                   }`}
//                   onKeyDown={(e) => e.key === "Enter" && handleJump()}
//                 />
//                 <button
//                   onClick={handleJump}
//                   className={`px-3 py-1 bg-[#99674a] text-sm rounded border transition-colors ${
//                     isDarkMode
//                       ? "border-stone-600 bg-stone-600 text-stone-300 hover:bg-stone-700"
//                       : "border-stone-300 text-stone-600 hover:bg-stone-100"
//                   }`}
//                 >
//                   Go
//                 </button>
//               </div>
//             </div>

//             {/* Search Section */}
//             <div
//               className={`p-3 border-b ${
//                 isDarkMode ? "border-stone-600" : "border-stone-300"
//               }`}
//             >
//               <div className="mb-2">
//                 <h4
//                   className={`text-sm font-medium ${
//                     isDarkMode ? "text-stone-200" : "text-stone-700"
//                   }`}
//                 >
//                   Search Sermon
//                 </h4>
//               </div>
//               <div className="space-y-2">
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search..."
//                     spellCheck={false}
//                     className={`flex-1 px-2 pl-3 outline-none py-2 text-sm  focus:ring-1 focus:ring-[#99674a] rounded-full border-none ${
//                       isDarkMode
//                         ? "bg-stone-700 border-stone-600 text-stone-200 placeholder-stone-400"
//                         : "bg-stone-50 border-stone-300 text-stone-700 placeholder-stone-500"
//                     }`}
//                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                   />
//                   <button
//                     onClick={handleSearch}
//                     className={`px-3 py-1 bg-[#99674a] text-sm rounded border transition-colors ${
//                       isDarkMode
//                         ? "border-stone-600 text-stone-300 hover:bg-stone-700"
//                         : "border-stone-300 text-stone-600 hover:bg-stone-100"
//                     }`}
//                   >
//                     <Search size={14} />
//                   </button>
//                 </div>

//                 {searchResults.length > 0 && (
//                   <div className="space-y-2">
//                     <div
//                       className={`text-xs p-2 rounded ${
//                         isDarkMode
//                           ? "bg-stone-700 text-stone-300"
//                           : "bg-stone-100 text-stone-600"
//                       }`}
//                     >
//                       {searchResults.reduce(
//                         (sum, result) => sum + result.matches,
//                         0
//                       )}{" "}
//                       matches in {searchResults.length} paragraphs
//                     </div>
//                     <div className="flex gap-1">
//                       <button
//                         onClick={() => onNavigateSearch("prev")}
//                         className={`flex-1 bg-[#99674a] px-2 py-1 text-xs rounded border transition-colors ${
//                           isDarkMode
//                             ? "border-stone-600 text-stone-300 hover:bg-stone-700"
//                             : "border-stone-300 text-stone-600 hover:bg-stone-100"
//                         }`}
//                       >
//                         ↑ Prev
//                       </button>
//                       <button
//                         onClick={() => onNavigateSearch("next")}
//                         className={`flex-1 px-2 bg-[#99674a] py-1 text-xs rounded border transition-colors ${
//                           isDarkMode
//                             ? "border-stone-600 text-stone-300 hover:bg-stone-700"
//                             : "border-stone-300 text-stone-600 hover:bg-stone-100"
//                         }`}
//                       >
//                         Next ↓
//                       </button>
//                     </div>
//                     <div
//                       className={`text-center text-xs ${
//                         isDarkMode ? "text-stone-400" : "text-stone-500"
//                       }`}
//                     >
//                       {currentMatch + 1} of{" "}
//                       {searchResults.reduce(
//                         (sum, result) => sum + result.matches,
//                         0
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Footer */}
//             <div
//               className={`p-2 text-center ${
//                 isDarkMode ? "text-stone-500" : "text-stone-500"
//               }`}
//             >
//               <div className="text-xs opacity-50">Reading Tools</div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// const SaveNotification = ({
//   show,
//   onClose,
// }: {
//   show: boolean;
//   onClose: () => void;
// }) => {
//   useEffect(() => {
//     if (show) {
//       const timer = setTimeout(onClose, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [show, onClose]);

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: 50 }}
//           className="fixed z-30 bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
//         >
//           Progress saved successfully! ✓
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// const SelectedSermon = ({
//   background,
//   setBackground,
// }: {
//   background: boolean;
//   setBackground: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const {
//     selectedMessage,
//     settings,
//     setRecentSermons,
//     isBookmarked,
//     toggleBookmark,
//     pendingSearchNav,
//     setPendingSearchNav,
//   } = useSermonContext();

//   const { isDarkMode } = useTheme();

//   const [showControlPanel, setShowControlPanel] = useState(false);
//   const [scrollPosition, setScrollPosition] = useState<number>(
//     Number(selectedMessage?.lastRead) || 0
//   );
//   const [currentParagraph, setCurrentParagraph] = useState(1);
//   const [searchResults, setSearchResults] = useState<
//     { paragraphId: number; matches: number }[]
//   >([]);
//   const [currentSearchMatch, setCurrentSearchMatch] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Text highlighting states
//   const [selectedText, setSelectedText] = useState("");
//   const [selectionRange, setSelectionRange] = useState<{
//     paragraphId: number;
//     startOffset: number;
//     endOffset: number;
//     text: string;
//   } | null>(null);
//   const [showColorPalette, setShowColorPalette] = useState(false);
//   const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });
//   const [highlights, setHighlights] = useState<{
//     [paragraphId: number]: {
//       [key: string]: {
//         startOffset: number;
//         endOffset: number;
//         color: string;
//         text: string;
//       };
//     };
//   }>({});

//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const [showSaveNotification, setShowSaveNotification] = useState(false);

//   const [sermonTColor, setSermonTColor] = useState("#f8d9c4");

//   // Color palette for highlighting
//   const highlightColors = [
//     { name: "Yellow", color: "#fef08a", textColor: "#854d0e" },
//     { name: "Green", color: "#bbf7d0", textColor: "#14532d" },
//     { name: "Blue", color: "#bfdbfe", textColor: "#1e3a8a" },
//     { name: "Pink", color: "#fce7f3", textColor: "#be185d" },
//     { name: "Purple", color: "#e9d5ff", textColor: "#6b21a8" },
//     { name: "Orange", color: "#fed7aa", textColor: "#c2410c" },
//     { name: "Red", color: "#fecaca", textColor: "#dc2626" },
//     { name: "Gray", color: "#e5e7eb", textColor: "#374151" },
//   ];

//   // Function to split sermon into paragraphs using mobile app's logic
//   const sermonParagraphs = useMemo((): SermonParagraph[] => {
//     if (!selectedMessage?.sermon) return [];

//     // Use the same formatting logic as mobile app
//     const formattedParagraphs = formatSermonIntoParagraphs(
//       selectedMessage.sermon
//     );

//     // Convert to SermonParagraph format for compatibility
//     return formattedParagraphs.map((content, index) => ({
//       id: index + 1,
//       content: content,
//       originalIndex: index,
//     }));
//   }, [selectedMessage?.sermon]);

//   // For very large sermons, we could use the async version
//   // This is kept for future optimization if needed
//   const processLargeSermonAsync = useCallback(async () => {
//     if (!selectedMessage?.sermon) return [];

//     try {
//       const formattedParagraphs = await formatSermonIntoParagraphsAsync(
//         selectedMessage.sermon
//       );

//       return formattedParagraphs.map((content, index) => ({
//         id: index + 1,
//         content: content,
//         originalIndex: index,
//       }));
//     } catch (error) {
//       console.error("Error processing large sermon:", error);
//       // Fallback to synchronous processing
//       return formatSermonIntoParagraphs(selectedMessage.sermon).map(
//         (content, index) => ({
//           id: index + 1,
//           content: content,
//           originalIndex: index,
//         })
//       );
//     }
//   }, [selectedMessage?.sermon]);

//   const highlightEndnotes = (text: string) => {
//     const endnoteRegex = /Endnote/gi;
//     const parts = text.split(endnoteRegex);

//     return (
//       <span>
//         {parts.map((part, i, arr) =>
//           i < arr.length - 1 ? (
//             <React.Fragment key={i}>
//               {part}
//               <mark
//                 className="bg-yellow-500 text-orange-900 px-1 rounded"
//                 title="William branham quote.🗝️🗝️ WMB quote ends when you dont find the paragraph numbers anymore"
//               >
//                 Endnote
//               </mark>
//             </React.Fragment>
//           ) : (
//             part
//           )
//         )}
//       </span>
//     );
//   };

//   // Handle text selection
//   const handleTextSelection = useCallback(() => {
//     const selection = window.getSelection();
//     if (!selection || selection.rangeCount === 0) {
//       setShowColorPalette(false);
//       return;
//     }

//     const range = selection.getRangeAt(0);
//     const selectedText = range.toString().trim();

//     if (selectedText.length === 0) {
//       setShowColorPalette(false);
//       return;
//     }

//     // Find the paragraph that contains the selection
//     let paragraphElement: Node | null = range.commonAncestorContainer;
//     while (
//       paragraphElement &&
//       paragraphElement.nodeType !== Node.ELEMENT_NODE
//     ) {
//       paragraphElement = paragraphElement.parentNode;
//     }

//     // Cast to HTMLElement and handle null case
//     let htmlElement = paragraphElement as HTMLElement | null;

//     // Traverse up to find the paragraph container
//     while (htmlElement && !htmlElement.id?.startsWith("paragraph-")) {
//       htmlElement = htmlElement.parentElement;
//     }

//     if (!htmlElement?.id) {
//       setShowColorPalette(false);
//       return;
//     }

//     const paragraphId = parseInt(htmlElement.id.replace("paragraph-", ""));

//     // Calculate text offsets within the paragraph
//     const paragraphText =
//       sermonParagraphs.find((p) => p.id === paragraphId)?.content || "";
//     const startOffset = paragraphText.indexOf(selectedText);
//     const endOffset = startOffset + selectedText.length;

//     if (startOffset === -1) {
//       setShowColorPalette(false);
//       return;
//     }

//     // Set selection info
//     setSelectionRange({
//       paragraphId,
//       startOffset,
//       endOffset,
//       text: selectedText,
//     });

//     // Position the color palette
//     const rect = range.getBoundingClientRect();
//     const scrollContainer = scrollContainerRef.current;
//     const containerRect = scrollContainer?.getBoundingClientRect() || {
//       left: 0,
//       top: 0,
//     };

//     setPalettePosition({
//       x: rect.left - containerRect.left + rect.width / 2,
//       y: rect.top - containerRect.top - 60,
//     });

//     setShowColorPalette(true);
//   }, [sermonParagraphs]);

//   // Apply highlight
//   const applyHighlight = useCallback(
//     (color: string, textColor: string) => {
//       if (!selectionRange) return;

//       const { paragraphId, startOffset, endOffset, text } = selectionRange;
//       const highlightKey = `${startOffset}-${endOffset}`;

//       setHighlights((prev) => {
//         const updated = { ...prev };
//         if (!updated[paragraphId]) {
//           updated[paragraphId] = {};
//         }

//         // Check if this exact highlight already exists with the same color
//         const existingHighlight = updated[paragraphId][highlightKey];
//         if (existingHighlight && existingHighlight.color === color) {
//           // Remove the highlight (toggle off)
//           delete updated[paragraphId][highlightKey];
//           if (Object.keys(updated[paragraphId]).length === 0) {
//             delete updated[paragraphId];
//           }
//         } else {
//           // Add or update the highlight
//           updated[paragraphId][highlightKey] = {
//             startOffset,
//             endOffset,
//             color,
//             text,
//           };
//         }

//         return updated;
//       });

//       // Clear selection and hide palette
//       window.getSelection()?.removeAllRanges();
//       setShowColorPalette(false);
//       setSelectionRange(null);
//     },
//     [selectionRange]
//   );

//   // Enhanced highlight function that handles both search highlighting and user highlights
//   const renderHighlightedText = useCallback(
//     (text: string, paragraphId: number, searchQuery?: string) => {
//       // Get highlights for this paragraph
//       const paragraphHighlights = highlights[paragraphId] || {};

//       // Create array of all highlights (search + user highlights)
//       const allHighlights: Array<{
//         start: number;
//         end: number;
//         type: "search" | "user";
//         color?: string;
//         textColor?: string;
//       }> = [];

//       // Add search highlights
//       if (searchQuery?.trim()) {
//         const regex = new RegExp(
//           `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
//           "gi"
//         );
//         let match;
//         while ((match = regex.exec(text)) !== null) {
//           allHighlights.push({
//             start: match.index,
//             end: match.index + match[0].length,
//             type: "search",
//           });
//         }
//       }

//       // Add user highlights
//       Object.values(paragraphHighlights).forEach((highlight) => {
//         allHighlights.push({
//           start: highlight.startOffset,
//           end: highlight.endOffset,
//           type: "user",
//           color: highlight.color,
//           textColor: highlightColors.find((c) => c.color === highlight.color)
//             ?.textColor,
//         });
//       });

//       // Sort highlights by start position
//       allHighlights.sort((a, b) => a.start - b.start);

//       // If no highlights, return text with endnotes only
//       if (allHighlights.length === 0) {
//         return highlightEndnotes(text);
//       }

//       // Render text with highlights
//       const parts: React.ReactNode[] = [];
//       let lastIndex = 0;

//       allHighlights.forEach((highlight, index) => {
//         // Add text before highlight
//         if (highlight.start > lastIndex) {
//           const beforeText = text.slice(lastIndex, highlight.start);
//           parts.push(
//             <span key={`before-${index}`}>{highlightEndnotes(beforeText)}</span>
//           );
//         }

//         // Add highlighted text
//         const highlightedText = text.slice(highlight.start, highlight.end);
//         if (highlight.type === "search") {
//           parts.push(
//             <mark
//               key={`search-${index}`}
//               className="text-white rounded-md"
//               style={{
//                 backgroundColor: "#9a674a",
//                 padding: "4px",
//               }}
//             >
//               {highlightedText}
//             </mark>
//           );
//         } else {
//           parts.push(
//             <span
//               key={`user-${index}`}
//               className="rounded-sm px-1 cursor-pointer"
//               style={{
//                 backgroundColor: highlight.color,
//                 color: highlight.textColor,
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 // Toggle off this specific highlight
//                 const highlightKey = `${highlight.start}-${highlight.end}`;
//                 setHighlights((prev) => {
//                   const updated = { ...prev };
//                   if (updated[paragraphId]?.[highlightKey]) {
//                     delete updated[paragraphId][highlightKey];
//                     if (Object.keys(updated[paragraphId]).length === 0) {
//                       delete updated[paragraphId];
//                     }
//                   }
//                   return updated;
//                 });
//               }}
//               title="Click to remove highlight"
//             >
//               {highlightedText}
//             </span>
//           );
//         }

//         lastIndex = highlight.end;
//       });

//       // Add remaining text
//       if (lastIndex < text.length) {
//         const remainingText = text.slice(lastIndex);
//         parts.push(
//           <span key="remaining">{highlightEndnotes(remainingText)}</span>
//         );
//       }

//       return <span>{parts}</span>;
//     },
//     [highlights, highlightColors]
//   );

//   // Color Palette Component
//   const ColorPalette = () => {
//     if (!showColorPalette || !selectionRange) return null;

//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.8, y: 10 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.8, y: 10 }}
//         className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1"
//         style={{
//           left: palettePosition.x - 140, // Center the palette
//           top: palettePosition.y,
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {highlightColors.map((colorOption) => {
//           const isCurrentlyHighlighted =
//             highlights[selectionRange.paragraphId]?.[
//               `${selectionRange.startOffset}-${selectionRange.endOffset}`
//             ]?.color === colorOption.color;

//           return (
//             <button
//               key={colorOption.name}
//               className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 relative ${
//                 isCurrentlyHighlighted
//                   ? "border-gray-800 dark:border-gray-200 scale-110"
//                   : "border-gray-300 dark:border-gray-600"
//               }`}
//               style={{ backgroundColor: colorOption.color }}
//               onClick={() =>
//                 applyHighlight(colorOption.color, colorOption.textColor)
//               }
//               title={`Highlight with ${colorOption.name}${
//                 isCurrentlyHighlighted ? " (Click to remove)" : ""
//               }`}
//             >
//               {isCurrentlyHighlighted && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <X size={12} className="text-gray-800 dark:text-gray-200" />
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </motion.div>
//     );
//   };

//   const highlightSearchText = useCallback((text: string, query: string) => {
//     if (!query?.trim()) return highlightEndnotes(text);

//     const regex = new RegExp(
//       `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
//       "gi"
//     );
//     const parts = text.split(regex);

//     return (
//       <span>
//         {parts.map((part: string, i: number) =>
//           regex.test(part) ? (
//             <mark
//               key={i}
//               className="text-backgroun text-white rounded-md"
//               style={{
//                 backgroundColor: "#9a674a",
//                 padding: "4px",
//               }}
//             >
//               {part}
//             </mark>
//           ) : (
//             <span key={i}>{highlightEndnotes(part)}</span>
//           )
//         )}
//       </span>
//     );
//   }, []);

//   // Search function using mobile app's logic
//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     if (!query.trim()) {
//       setSearchResults([]);
//       setCurrentSearchMatch(0);
//       return;
//     }

//     // Use mobile app's search logic
//     const paragraphTexts = sermonParagraphs.map((p) => p.content);
//     const resultIndices = searchSermon(paragraphTexts, query);

//     // Convert to current format for compatibility
//     const results: { paragraphId: number; matches: number }[] =
//       resultIndices.map((index) => ({
//         paragraphId: index + 1, // Convert to 1-based for UI
//         matches: 1, // Each result is one match
//       }));

//     setSearchResults(results);
//     setCurrentSearchMatch(0);

//     // Navigate to first match
//     if (results.length > 0) {
//       jumpToParagraph(results[0].paragraphId);
//     }
//   };

//   // Navigate search results
//   const handleNavigateSearch = (direction: "next" | "prev") => {
//     if (searchResults.length === 0) return;

//     const totalMatches = searchResults.reduce(
//       (sum, result) => sum + result.matches,
//       0
//     );
//     let newMatchIndex = currentSearchMatch;

//     if (direction === "next") {
//       newMatchIndex = (currentSearchMatch + 1) % totalMatches;
//     } else {
//       newMatchIndex =
//         currentSearchMatch === 0 ? totalMatches - 1 : currentSearchMatch - 1;
//     }

//     setCurrentSearchMatch(newMatchIndex);

//     // Find which paragraph this match belongs to
//     let matchCount = 0;
//     for (const result of searchResults) {
//       if (matchCount + result.matches > newMatchIndex) {
//         jumpToParagraph(result.paragraphId);
//         break;
//       }
//       matchCount += result.matches;
//     }
//   };

//   // Jump to specific paragraph
//   const jumpToParagraph = (paragraphId: number) => {
//     const element = document.getElementById(`paragraph-${paragraphId}`);
//     if (element && scrollContainerRef.current) {
//       const container = scrollContainerRef.current;
//       const elementTop = element.offsetTop;

//       // Scroll to show the paragraph at the top with some padding
//       // This ensures the paragraph is fully visible without overshooting
//       const paddingTop = 20; // Add some padding from the top

//       container.scrollTo({
//         top: Math.max(0, elementTop - paddingTop),
//         behavior: "smooth",
//       });
//     }
//   };

//   // Track current paragraph based on scroll position
//   useEffect(() => {
//     const container = scrollContainerRef.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const scrollTop = container.scrollTop;
//       setScrollPosition(scrollTop);

//       // Find current paragraph in view
//       const containerRect = container.getBoundingClientRect();
//       const centerY = containerRect.top + containerRect.height / 1;

//       let closestParagraph = 1;
//       let closestDistance = Infinity;

//       sermonParagraphs.forEach((paragraph) => {
//         const element = document.getElementById(`paragraph-${paragraph.id}`);
//         if (element) {
//           const elementRect = element.getBoundingClientRect();
//           const distance = Math.abs(
//             elementRect.top + elementRect.height / 2 - centerY
//           );
//           if (distance < closestDistance) {
//             closestDistance = distance;
//             closestParagraph = paragraph.id;
//           }
//         }
//       });

//       setCurrentParagraph(closestParagraph);
//     };

//     container.addEventListener("scroll", handleScroll);
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, [sermonParagraphs]);

//   // Save progress
//   useEffect(() => {
//     if (!selectedMessage?.id) return;

//     const saveScrollPosition = () => {
//       const recentSermons = JSON.parse(
//         localStorage.getItem("recentSermons") || "[]"
//       );
//       const currentSermonIndex = recentSermons.findIndex(
//         (sermon: Sermon) => sermon.id === (selectedMessage.id as any)
//       );

//       if (currentSermonIndex !== -1) {
//         const updatedSermons = [...recentSermons];
//         updatedSermons[currentSermonIndex] = {
//           ...selectedMessage,
//           lastRead: scrollPosition,
//           lastParagraph: currentParagraph,
//         };
//         localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
//         setRecentSermons(updatedSermons);
//       }
//     };

//     const interval = setInterval(saveScrollPosition, 5000); // Auto-save every 5 seconds
//     return () => {
//       clearInterval(interval);
//       saveScrollPosition(); // Save on unmount
//     };
//   }, [selectedMessage, scrollPosition, currentParagraph, setRecentSermons]);

//   useEffect(() => {
//     setSermonTColor(isDarkMode ? "#f4d1b9" : "#efcda2");
//   }, [isDarkMode]);
//   // Handle pending search navigation
//   useEffect(() => {
//     if (
//       pendingSearchNav &&
//       selectedMessage?.id === pendingSearchNav.targetSermonId
//     ) {
//       // Set the search query for highlighting
//       setSearchQuery(pendingSearchNav.searchTerm);

//       // Wait for paragraphs to render then navigate
//       const timer = setTimeout(() => {
//         jumpToParagraph(pendingSearchNav.targetParagraphId);
//         // Clear the pending navigation
//         setPendingSearchNav(null);
//       }, 100);

//       return () => clearTimeout(timer);
//     }
//   }, [pendingSearchNav, selectedMessage, setPendingSearchNav]);

//   const handleManualSave = () => {
//     if (!selectedMessage?.id) return;

//     const recentSermons = JSON.parse(
//       localStorage.getItem("recentSermons") || "[]"
//     );
//     const currentSermonIndex = recentSermons.findIndex(
//       (sermon: Sermon) => sermon.id === (selectedMessage.id as any)
//     );

//     if (currentSermonIndex !== -1) {
//       const updatedSermons = [...recentSermons];
//       updatedSermons[currentSermonIndex] = {
//         ...selectedMessage,
//         lastRead: scrollPosition,
//         lastParagraph: currentParagraph,
//       };
//       localStorage.setItem("recentSermons", JSON.stringify(updatedSermons));
//       setRecentSermons(updatedSermons);
//     }
//     setShowSaveNotification(true);
//   };

//   return (
//     <div className="bg-white dark:bg-background h-screen  relative  w-screen">
//       <SaveNotification
//         show={showSaveNotification}
//         onClose={() => setShowSaveNotification(false)}
//       />

//       {/* Floating Control Button */}
//       {selectedMessage?.type === "text" && (
//         <motion.button
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => setShowControlPanel(!showControlPanel)}
//           className={`fixed right-6 bottom-3 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
//             isDarkMode
//               ? "bg-primary hover:bg-gray-700 text-gray-200"
//               : "bg-white hover:bg-gray-50 text-gray-700"
//           } border-2 ${
//             showControlPanel
//               ? isDarkMode
//                 ? "border-blue-500"
//                 : "border-blue-500"
//               : isDarkMode
//               ? "border-primary"
//               : "border-gray-300"
//           }`}
//         >
//           <BookOpen size={24} className="mx-auto" />
//         </motion.button>
//       )}

//       {/* Receipt Style Control Panel */}
//       <ReceiptStylePanel
//         show={showControlPanel}
//         onClose={() => setShowControlPanel(false)}
//         sermon={selectedMessage}
//         onSearch={handleSearch}
//         searchResults={searchResults}
//         currentMatch={currentSearchMatch}
//         onNavigateSearch={handleNavigateSearch}
//         currentParagraph={currentParagraph}
//         onJumpToParagraph={jumpToParagraph}
//         // theme={isDarkMode}
//       />

//       {/* Color Palette for Text Highlighting */}
//       <ColorPalette />

//       <div className="bg-center flex flex-col pb-10 ">
//         <div className="mb-5 h-full">
//           <div
//             className="rounded-lg px-4 h-[100vh] overflow-y-scroll overflow-x-hidden no-scrollbar text-wrap"
//             ref={scrollContainerRef}
//             style={{
//               scrollbarWidth: "thin",
//               scrollbarColor: !isDarkMode
//                 ? "#c0c0c0 #f3f4f6"
//                 : "#422e22 #202020",
//             }}
//           >
//             {selectedMessage?.type === "text" ? (
//               <div className="h-full  mx-auto px-12 ">
//                 <div className="absolute flex-col items-center gap-10 top-60 left-4 ">
//                   {/* two colors rounded cricles verticall arranage */}
//                   <div
//                     className={`h-2 w-2 rounded-full mb-5 left-0 hover:scale-105 duration-75 cursor-pointer ${
//                       isDarkMode ? "bg-[#f9fafb]" : "bg-[#1c1917]"
//                     }`}
//                     onClick={() => {
//                       setSermonTColor("");
//                       setSermonTColor((prev) =>
//                         isDarkMode ? "#fbfaf9" : "#1c1917"
//                       );
//                     }}
//                   >
//                     <TextSelectIcon
//                       className={` ${
//                         isDarkMode
//                           ? " text-[#f2b084]"
//                           : "text-background textst"
//                       }`}
//                     />
//                   </div>
//                   <div
//                     className={`w-2 h-2 rounded-full mb-2 hover:scale-105 duration-75 cursor-pointer ${
//                       isDarkMode ? "bg-[#a8a29e]" : "bg-[#57534e]"
//                     }`}
//                     onClick={() => {
//                       setSermonTColor("");
//                       setSermonTColor((prev) =>
//                         isDarkMode ? "#f4d1b9" : "#6c6c6c"
//                       );
//                     }}
//                   >
//                     {" "}
//                     <TextSelectIcon
//                       className={` ${
//                         isDarkMode ? " text-[#f2b084]" : "text-background "
//                       }`}
//                     />
//                   </div>
//                 </div>
//                 {/* Sermon Header */}
//                 <div className="mb-4 text-center text-background">
//                   {/* <h1 className="text-4xl font-serif text-stone-500 dark:text-gray-50 font-bold mb-4">
//                     {selectedMessage.title}
//                   </h1> */}
//                   <TypingVerse
//                     verse={selectedMessage?.title || ""}
//                     typingSpeed={40}
//                     minHeight={0}
//                     fontFamily="Zilla Slab"
//                     fontSize={30}
//                     color={isDarkMode ? "#cbcbcb " : "black "}
//                     align="center"
//                   />
//                   {/* <p className="text-lg font-serif italic text-center text-stone-500 dark:text-gray-50">
//                     {selectedMessage?.location}
//                   </p> */}
//                 </div>

//                 {/* Paragraphed Content */}
//                 <div className="space-y-6 relative ">
//                   {sermonParagraphs.map((paragraph) => (
//                     <div
//                       key={paragraph.id}
//                       id={`paragraph-${paragraph.id}`}
//                       className="relative group bg-transparent"
//                     >
//                       {/* Paragraph Number */}
//                       <div
//                         className={`absolute flex items-center ${
//                           Number(settings.fontSize) > 40 ? "-top-20" : "-top-4"
//                         } -left-10 font-archivo font-bold pb-3 w-12 text-right ${
//                           currentParagraph === paragraph.id
//                             ? isDarkMode
//                               ? "text-[#d57a3e] font-bold"
//                               : "text-[#4b2a14] font-bold"
//                             : isDarkMode
//                             ? "text-[#eba373]"
//                             : "text-[#4b2a14]"
//                         } transition-colors duration-200`}
//                       >
//                         #{" "}
//                         <span style={{ fontSize: settings.fontSize + "px" }}>
//                           {paragraph.id}
//                         </span>
//                       </div>

//                       {/* Bookmark Button - Shows on hover */}
//                       <button
//                         onClick={() => {
//                           if (selectedMessage) {
//                             toggleBookmark(
//                               selectedMessage.id as any,
//                               selectedMessage.title,
//                               paragraph.id,
//                               paragraph.content,
//                               selectedMessage.location,
//                               selectedMessage.year?.toString()
//                             );
//                           }
//                         }}
//                         className={`absolute -right-12 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 ${
//                           selectedMessage &&
//                           isBookmarked(selectedMessage.id as any, paragraph.id)
//                             ? isDarkMode
//                               ? "bg-yellow-600 hover:bg-yellow-500 text-yellow-100"
//                               : "bg-yellow-500 hover:bg-yellow-400 text-white"
//                             : isDarkMode
//                             ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
//                             : "bg-gray-200 hover:bg-gray-300 text-gray-600"
//                         } shadow-lg border-2 ${
//                           selectedMessage &&
//                           isBookmarked(selectedMessage.id as any, paragraph.id)
//                             ? "border-yellow-400"
//                             : isDarkMode
//                             ? "border-gray-600"
//                             : "border-gray-300"
//                         }`}
//                         title={
//                           selectedMessage &&
//                           isBookmarked(selectedMessage.id as any, paragraph.id)
//                             ? "Remove bookmark"
//                             : "Add bookmark"
//                         }
//                       >
//                         {selectedMessage &&
//                         isBookmarked(
//                           selectedMessage.id as any,
//                           paragraph.id
//                         ) ? (
//                           <BookmarkCheck size={14} />
//                         ) : (
//                           <Bookmark size={14} />
//                         )}
//                       </button>

//                       {/* Paragraph Content */}
//                       <div
//                         className={`leading-relaxed bg-transparent text-stone-600 dark:text-accent text-wrap break-words text-center py-2 rounded-r-lg transition-all duration-200  ${
//                           currentParagraph === paragraph.id
//                             ? isDarkMode
//                               ? "bg-primary dark:bg-transparent border-l-4 border-blue-500"
//                               : "bg-blue-50 border-l-4 border-blue-500"
//                             : "border-l-4 border-transparent"
//                         }`}
//                         style={{
//                           fontFamily: settings.fontFamily || "Zilla Slab",
//                           fontWeight: settings.fontWeight,
//                           fontSize: `${settings.fontSize}px`,
//                           fontStyle: settings.fontStyle,
//                           color: isDarkMode ? sermonTColor : "#000000",
//                         }}
//                         onMouseUp={handleTextSelection}
//                       >
//                         {renderHighlightedText(
//                           paragraph.content,
//                           paragraph.id,
//                           searchQuery
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <DownloadSermon />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectedSermon;
