/**
 * Utility functions for sermon processing and searching
 */

/**
 * Ultra-fast async formatter using chunked processing for large sermon texts
 * Optimized for low-resource devices with progressive processing
 * @param text - Raw sermon text
 * @returns Promise<Array> - Array of paragraph strings
 */
export const formatSermonIntoParagraphsAsync = async (
  text: string
): Promise<string[]> => {
  if (!text) return [];

  return new Promise((resolve) => {
    // Use multiple smaller chunks for better performance on low-resource devices
    const processInChunks = async () => {
      try {
        // For very large texts, use worker-like approach
        if (text.length > 50000) {
          const result = await processLargeTextInBatches(text);
          resolve(result);
        } else {
          // For smaller texts, use optimized direct processing
          const result = formatSermonIntoParagraphsFast(text);
          resolve(result);
        }
      } catch (error) {
        console.error("Error processing sermon:", error);
        // Fallback to simple processing
        resolve(formatSermonIntoParagraphsFast(text));
      }
    };

    // Process in next frame to avoid blocking UI
    setTimeout(processInChunks, 0);
  });
};

/**
 * Process very large texts in smaller batches for better performance
 * @param text - Raw sermon text
 * @returns Promise<Array> - Array of paragraph strings
 */
const processLargeTextInBatches = async (text: string): Promise<string[]> => {
  const batchSize = 10000; // Process 10KB at a time
  const batches: string[] = [];

  for (let i = 0; i < text.length; i += batchSize) {
    batches.push(text.substring(i, i + batchSize));
  }

  let allParagraphs: string[] = [];

  for (const batch of batches) {
    // Process each batch with a small delay to prevent blocking
    await new Promise((resolve) => setTimeout(resolve, 5));
    const batchParagraphs = formatSermonIntoParagraphsFast(batch);
    allParagraphs = allParagraphs.concat(batchParagraphs);
  }

  return allParagraphs;
};

/**
 * Optimized fast formatter for sermon texts - Enhanced for low-resource devices
 * @param text - Raw sermon text
 * @returns Array - Array of paragraph strings
 */
const formatSermonIntoParagraphsFast = (text: string): string[] => {
  if (!text) return [];

  // Early return for small texts
  if (text.length < 100) {
    return [text.trim()];
  }

  // Super optimized processing - avoid multiple passes and use simpler operations
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();

  // Split and filter in one pass with simpler logic
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 5); // Lower threshold for faster processing

  // Simplified processing for better performance
  const result: string[] = [];
  const maxLength = 1000; // Slightly larger to reduce processing overhead

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    if (trimmed.length <= maxLength) {
      result.push(trimmed);
    } else {
      // Simplified sentence splitting - avoid complex regex
      const parts = trimmed.split(". ");
      let current = "";

      for (const part of parts) {
        const testLength = current.length + part.length + 2; // +2 for ". "

        if (testLength > maxLength && current) {
          result.push(current.trim());
          current = part;
        } else {
          current += (current ? ". " : "") + part;
        }
      }

      if (current.trim()) {
        result.push(current.trim());
      }
    }
  }

  return result;
};

/**
 * Formats sermon text into properly sized paragraphs (optimized)
 * @param text - Raw sermon text
 * @returns Array - Array of paragraph strings
 */
export const formatSermonIntoParagraphs = (text: string): string[] => {
  if (!text) return [];

  // Early return for small texts
  if (text.length < 100) {
    return [text.trim()];
  }

  // Use more efficient regex patterns
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  // Process paragraphs more efficiently
  const formattedParagraphs: string[] = [];
  const maxLength = 800;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();

    if (paragraph.length <= maxLength) {
      formattedParagraphs.push(paragraph);
    } else {
      // Split long paragraphs more efficiently
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let currentParagraph = "";

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();

        if (currentParagraph.length + trimmedSentence.length > maxLength) {
          if (currentParagraph.trim()) {
            formattedParagraphs.push(currentParagraph.trim());
          }
          currentParagraph = trimmedSentence;
        } else {
          currentParagraph += (currentParagraph ? " " : "") + trimmedSentence;
        }
      }

      if (currentParagraph.trim()) {
        formattedParagraphs.push(currentParagraph.trim());
      }
    }
  }

  return formattedParagraphs;
};

/**
 * Optimized search for text in paragraphs or by paragraph number
 * @param paragraphs - Array of paragraph strings
 * @param searchPhrase - Text to search for or paragraph number
 * @returns Array - Array of search result indices
 */
export const searchSermon = (
  paragraphs: string[],
  searchPhrase: string
): number[] => {
  if (!searchPhrase || !paragraphs || paragraphs.length === 0) {
    return [];
  }

  const searchResults: number[] = [];
  const lowerSearchPhrase = searchPhrase.toLowerCase();

  // Check if search phrase is a paragraph number
  const paragraphNumberMatch = searchPhrase.match(/^#?(\d+)$/);
  if (paragraphNumberMatch) {
    const paragraphNumber = parseInt(paragraphNumberMatch[1]);
    if (paragraphNumber > 0 && paragraphNumber <= paragraphs.length) {
      return [paragraphNumber - 1]; // Convert to zero-based index
    }
  }

  // Optimized text search using forEach instead of filter/map
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.toLowerCase().includes(lowerSearchPhrase)) {
      searchResults.push(index);
    }
  });

  return searchResults;
};

/**
 * Debounced search function to prevent excessive searching
 * @param paragraphs - Array of paragraph strings
 * @param searchPhrase - Text to search for
 * @param delay - Delay in milliseconds
 * @returns Promise<Array> - Promise that resolves to search results
 */
export const searchSermonDebounced = (
  paragraphs: string[],
  searchPhrase: string,
  delay: number = 300
): Promise<number[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(searchSermon(paragraphs, searchPhrase));
    }, delay);
  });
};
