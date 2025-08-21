// Enhanced paragraph interface
export interface SermonParagraph {
  id: number;
  content: string;
  originalIndex: number;
}

// Search results interface
export interface SearchResult {
  paragraphId: number;
  matches: number;
}

// Selection range interface for text highlighting
export interface SelectionRange {
  paragraphId: number;
  startOffset: number;
  endOffset: number;
  text: string;
}

// Highlight data structure
export interface HighlightData {
  startOffset: number;
  endOffset: number;
  color: string;
  text: string;
}

// Highlights state interface
export interface HighlightsState {
  [paragraphId: number]: {
    [key: string]: HighlightData;
  };
}

// Color option interface
export interface ColorOption {
  name: string;
  color: string;
  textColor: string;
}

// Palette position interface
export interface PalettePosition {
  x: number;
  y: number;
}
