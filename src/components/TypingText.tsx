import React, { useEffect, useState } from "react";
import "../styles/typing_text.css"; // optional for styling

const TypingVerse = ({
  verse,
  fontSize,
  fontFamily,
  typingSpeed = 50,
  minHeight = 140,
  color = "black",
  align = "left",
}: {
  verse: string;
  typingSpeed: number;
  minHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  align?: React.CSSProperties["textAlign"];
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < verse.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + verse.charAt(index));
        setIndex(index + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }
  }, [index, verse, typingSpeed]);

  return (
    <div
      className="typing-container w-[95%]  text-center  rounded-xl px-2 "
      style={{ minHeight: minHeight + "px" }}
    >
      <p
        className="typing-text  font-bold underline  text-black dark:text-gray-50 "
        style={{
          fontFamily: fontFamily,
          fontSize: fontSize + "px",
          color: color,
          textAlign: align as React.CSSProperties["textAlign"],
          lineHeight: "1.5",
        }}
      >
        “{displayedText}”
      </p>
    </div>
  );
};

export default TypingVerse;
