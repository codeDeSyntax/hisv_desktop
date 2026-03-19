export interface EndnoteData {
  datecode: string | null;
  title: string | null;
  paragraph: string | null;
  quoteText: string | null;
  longQuote: string | null;
  keywords: string | null;
  fullEndnote: string;
}

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "is",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "not",
  "i",
  "he",
  "she",
  "it",
  "we",
  "you",
  "they",
  "this",
  "that",
  "these",
  "those",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "me",
  "him",
  "us",
  "them",
  "from",
  "by",
  "as",
  "which",
  "who",
  "what",
  "when",
  "where",
  "how",
  "if",
  "all",
  "so",
  "than",
  "then",
  "there",
  "no",
  "up",
  "out",
  "into",
  "about",
  "through",
  "said",
  "thus",
  "thee",
  "thou",
  "thy",
  "ye",
  "now",
  "just",
  "more",
  "also",
  "upon",
  "one",
  "two",
  "three",
  "four",
  "five",
]);

/**
 * Parses an endnote reference from a sermon paragraph.
 * Format: "Endnote: 56-0527 - At Kadesh-Barnea William Marrion Branham 130 THE QUOTE..."
 */
export function parseEndnote(paragraphText: string): EndnoteData | null {
  if (!/endnote/i.test(paragraphText)) return null;

  // Match from "Endnote" (optionally followed by colon/space) through "William [Marrion] Branham"
  const endnoteRegex = /Endnote[:\s]*([\s\S]*?)William\s+(?:Marrion\s+)?Branham/i;
  const match = endnoteRegex.exec(paragraphText);

  if (!match) return null;

  const fullEndnote = match[0];
  const innerContent = match[1].trim();

  // Extract datecode: NN-NNNN[optional letter suffix]
  const datecodeRegex = /^(\d{2}-\d{4}[A-Za-z]?)\s*-\s*/;
  const datecodeMatch = datecodeRegex.exec(innerContent);

  let datecode: string | null = null;
  let afterDatecode = innerContent;

  if (datecodeMatch) {
    datecode = datecodeMatch[1];
    afterDatecode = innerContent.slice(datecodeMatch[0].length).trim();
  }

  // Title is what remains after the datecode in the inner content
  const title = afterDatecode.trim() || null;

  // Everything after "William Marrion Branham" contains: paragraph number + quote text
  const afterFullMatch = paragraphText.slice(match.index + match[0].length);

  // Extract paragraph number: expects a number right after the author name
  const paragraphMatch = /^\s*(\d+)\s+/.exec(afterFullMatch);
  const paragraph = paragraphMatch ? paragraphMatch[1] : null;

  // Quote text begins after the paragraph number
  let quoteText = afterFullMatch.trim();
  if (paragraphMatch) {
    quoteText = afterFullMatch.slice(paragraphMatch[0].length).trim();
  }

  // longQuote: first 8 words, lowercased (for ExactPhrase search)
  // Strip surrounding special chars (parens, brackets, quotes) but keep normal punctuation
  const cleanForSearch = (w: string) =>
    w.replace(/^[()\[\]{}"'`]+|[()\[\]{}"'`?]+$/g, "");

  const words = quoteText.split(/\s+/).filter(Boolean);
  const longQuote =
    words.length > 0
      ? words
          .slice(0, 8)
          .map(cleanForSearch)
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
      : null;

  // keywords: up to 3 meaningful (non-stop-word) terms, min 3 chars (for AllWords fallback)
  // Strip ALL leading/trailing punctuation from each word before using it
  const stripPunct = (w: string) => w.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");
  const keywords =
    words
      .map(stripPunct)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
      .slice(0, 3)
      .join(" ") || null;

  return { datecode, title, paragraph, quoteText: quoteText || null, longQuote, keywords, fullEndnote };
}
